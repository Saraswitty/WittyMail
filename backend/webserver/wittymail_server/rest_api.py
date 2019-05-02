#!/usr/bin/env python
# coding=utf-8

import os, sys

sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

from wittymail_server import flask_app
from flask import jsonify, request, json, url_for
from flask_classy import FlaskView, route
import util.version as version
import util.logger as logger
from flask import send_file
from wittymail_server.Sheet import Sheet
from util.FileUtils import FileUtils
from mailer.Email import Email

log = logger.get_logger(__name__)

HTTP_OK         = 200
HTTP_CREATED    = 201
HTTP_NOT_FOUND  = 404
HTTP_BAD_INPUT  = 400
HTTP_SERVER_ERROR = 500

class SheetView(FlaskView):
    """
    APIs for the sheet containing sponsor/beneficiary details

    /api/sheet/...
    """
    route_prefix = flask_app.config['URL_DEFAULT_PREFIX_FOR_API']

    @route('upload', methods=['POST'])
    def upload(self):
        """
        Upload a new Excel sheet as input

        :return:
        """
        log.debug("Uploading sheet: %s", request.files)
        excel_dir = flask_app.config['EXCEL_DIR']

        f = request.files['sponsor-sheet']
        excel_file = os.path.join(excel_dir, f.filename)
        f.save(excel_file)
        log.info('Sheet file saved as: %s', excel_file)

        # Parse the Excel sheet and store the contents in-memory
        sheet = Sheet.getInstance(excel_file)
        sheet.dump_to_memory()

        return (jsonify({}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    def file(self):
        """
        Get the Excel sheet (*.xlsx file) updated with 'status' and other columns

        :return:
        """
        sheet = Sheet.getInstance()
        excel_file = sheet.save_to_file()
        log.info("Send sheet back to frontend: %s", excel_file)

        return send_file(excel_file)

    def contents(self):
        """
        Get the contents of the sheet updated with 'status' and other columns

        :return:
        """
        log.info("URL: %s", url_for('SheetView:some'))
        sheet = Sheet.getInstance()
        headers, data = sheet.get_all_content()

        frozen_attachment_index, email_to_index, email_cc_index, email_subject_index, email_body_index  = sheet.get_column_mappings(["frozen_attachment", "email_to", "email_cc", "email_subject", "email_body"])

        # Create fodder_list in email_broker
        output_list = []
        for d in data:
            attachments = []
            for attachment in d[frozen_attachment_index]:
                at_dict = {"name": attachment, "url": os.path.join("/attachment/", attachment)}
                attachments.append(at_dict)
            email = { \
                "from": Email.get_email_from(),
                "to": d[email_to_index],
                "cc": d[email_cc_index],
                "attachment": attachments,
                "subject": d[email_subject_index],
                "body": d[email_body_index],
            }

            tmp = dict(zip(headers, d))
            tmp["email"] = email
            output_list.append(tmp)

        return (jsonify({'headers': headers, 'contents': output_list}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    def headers(self):
        """
        Get the header row in the Excel sheet with the first 3 rows as sample values

        :return:
        """
        sheet = Sheet.getInstance()
        headers, data = sheet.get_headers_with_sample_rows(row_count = 3)
        return (jsonify({'headers': headers, 'contents': data}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('mapping', methods=['POST'])
    def mapping(self):
        """
        Specify the mapping of columns in the Excel sheet to targets (eg. attachment names)

        :return:
        """
        data = json.loads(request.data)
        sheet = Sheet.getInstance()
        sheet.set_column_mappings(data)
        return (jsonify({}),
                HTTP_OK,
                {'ContentType': 'application/json'})

class AttachmentView(FlaskView):
    """
    APIs for attachments to be used with the Sheet (by mapping) and sent with emails
    """
    route_prefix = flask_app.config['URL_DEFAULT_PREFIX_FOR_API']

    @route('get_candidates', methods=['GET'])
    def get_candidates(self):
        data = json.loads(request.data)
        row = data['row']
        sheet = Sheet.getInstance()
        attachment_value = sheet.get_column_value(row, ['attachment'])
        candidates = FileUtils.find_n_files_by_fuzzymatch(flask_app.config['ATTACHMENTS_DIR'], attachment_value)
        candidate_list = [{'pdfname': c} for c in candidates]
        return (jsonify({'candidates': candidate_list}),
                HTTP_OK,
                {'ContentType': 'application/json'})
        

    @route('upload', methods=['POST'])
    def upload_attachment(self):
        """
        The 3rd party Angular plugin ng6-file-upload makes one POST call per file instead of
        sending them all at once.

        To workaround this stupidity, this API is idempotent and will just keep saving
        all files in the same dir
        """
        if 'attachment' in request.files:
            a = request.files['attachment']
            attachment_save_path = os.path.join(flask_app.config['ATTACHMENTS_DIR'], a.filename)

            a.save(attachment_save_path)
            log.info('Attachment file saved at: %s', attachment_save_path)

            #emailapi_broker.save_attachment_dir(attachment_dir)
            # TODO Call change_email_fodder_status() from save_attachment_dir()
            #emailapi_broker.change_email_fodder_status(a.filename)

        elif 'common_attachment' in request.files:
            a = request.files['common_attachment']
            attachment_save_path = os.path.join(flask_app.config['COMMON_ATTACHMENTS_DIR'], a.filename)

            a.save(attachment_save_path)
            log.info('Attachment file saved at: %s', attachment_save_path)

        else:
            log.error('No file found in payload: %s', request.files)
            return (jsonify({'error': 'Request payload must have either files.attachment or files.common_attachment'}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        return "Attachments saved successfully", HTTP_OK

    @route('upload_for_row', methods=['POST'])
    def upload_attachment_for_row(self):
        """
        """
        a = request.files['attachment']
        attachment_dir = flask_app.config['ATTACHMENTS_DIR']

        a.save(os.path.join(attachment_dir, a.filename))
        log.info('Attachment file saved as = %s' % (attachment_dir + a.filename))

        data = json.loads(request.data)

        s = Sheet.getInstance()
        s.set_attachment(data['attachment_name'])
        return "Attachments set successfully", HTTP_OK


    @route('rotate', methods=['POST'])
    def rotate(self):
        data = json.loads(request.data)
        filepath = os.path.join(flask_app.config['ATTACHMENTS_DIR'], data['filename'])
        
        try:
            util = FileUtils()
            util.pdf_rotate(filepath, data['direction'])
        except Exception as e:
            log.exception("Failed to rotate: %s", data)
            return (str(e), HTTP_SERVER_ERROR, {'ContentType': 'text/plain'})
        
        return (jsonify({}), HTTP_OK, {'ContentType': 'application/json'})

class EmailView(FlaskView):
    """
    APIs for email server, contents and actions
    """
    route_prefix = flask_app.config['URL_DEFAULT_PREFIX_FOR_API']

    @route('server', methods=['POST'])
    def server_details(self):
        """
        SMTP server URL and credentials

        :return:
        """
        data = json.loads(request.data)

        assert len(data['username']) > 0 and len(data['password']) > 0, "username or password not provided"

        smtp_provider_class = email_provider.choose_email_provider("SMTP")
        self.smtp_provider = smtp_provider_class(data['username'], "smtp.gmail.com", 587, data['username'], data['password'])

        return (jsonify({'error_message': ""}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('template_to_reality', methods=['POST'])
    def template_to_reality(self):
        """
        Convert an email template (subject or body) by replacing column name placeholders with actual data

        :return:
        """
        data = json.loads(request.data)
        fodder = emailapi_broker.get_email_fodder()
        result_str = emailapi_broker.template_to_str(data['template'], fodder[0])

        return (jsonify({'reality': result_str}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('metadata_contents', methods=['POST'])
    def metadata_contents(self):
        """
        Specify email metadata (to, cc etc.) and content templates (subject, body)

        :return:
        """
        data = json.loads(request.data)
        if data['to_column'] == None or data['cc_column'] == None or data['subject_template'] == None or data[
            'body_template'] == None:
            return (jsonify({'error_message': "to, cc, subject or body not provided"}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        e = emailapi_broker.save_extended_fodder(data['to_column'], data['cc_column'], data['subject_template'],
                                                 data['body_template'])
        if e[0] is not 0:
            return (jsonify({"err_msg": e[1]}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        return (jsonify({}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('send_test', methods=['POST'])
    def send_test(self):
        """
        Send a test email (metadata and actual content in payload)

        :return:
        """
        try:
            data = json.loads(request.data)
            tos = []
            tos.append(data['to'])
            e = emailapi_broker.test_email(tos)
            if e[0] is not 0:
                return (jsonify({"err_msg": e[1]}),
                        HTTP_BAD_INPUT,
                        {'ContentType': 'application/json'})

            return (jsonify({}),
                    HTTP_OK,
                    {'ContentType': 'application/json'})
        except:
            log.exception("Failed to send test email")

    @route('send', methods=['POST'])
    def send(self):
        """
        Send a single email (metadata and actual content in payload)

        :return:
        """
        try:
            data = json.loads(request.data)

            tos = []
            tos.append(data['to'])

            ccs = []
            ccs.append(data['cc'])

            attachments = []
            at = data['attachment']
            for a in at:
                attachments.append(a["name"])

            e = emailapi_broker.send_email(data['from'], tos, data['subject'], data['body'], ccs, attachments)
            if e[0] is not 0:
                return (jsonify({"err_msg": e[1]}),
                        HTTP_BAD_INPUT,
                        {'ContentType': 'application/json'})

            return (jsonify({}),
                    HTTP_OK,
                    {'ContentType': 'application/json'})
        except:
            log.exception("Failed to send email")


SheetView.register(flask_app)
AttachmentView.register(flask_app)
EmailView.register(flask_app)

@flask_app.route("/api/version", methods=['GET'])
def get_version():
    """
    Get backend version (this doesn't need a CLassView since its a single API)

    :return:
    """
    log.debug('Current version = %s' % (version.__pretty_version__))
    return (jsonify({'version': version.__pretty_version__}),
              HTTP_OK,
              {'ContentType':'application/json'})