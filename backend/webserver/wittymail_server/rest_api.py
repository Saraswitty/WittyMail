#!/usr/bin/env python
# coding=utf-8

import os, sys
import re
import pdb
import copy
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

from flask import send_from_directory
from wittymail_server import flask_app
from flask import jsonify, request, json, url_for
from flask_classy import FlaskView, route
import util.version as version
import util.logger as logger
from flask import send_file
from wittymail_server.Sheet import Sheet
from util.FileUtils import FileUtils
from mailer.Email import Email
from mailer.EmailProvider import EmailProvider

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

    def _convert_header_data_list_to_dict(self, headers_, extended_headers_, data_):
            headers = copy.deepcopy(headers_)
            extended_headers  = copy.deepcopy(extended_headers_)
            data = copy.deepcopy(data_)

            dict_ = dict(zip(headers, data))
            extended_headers.reverse()
            data.reverse()
            dict2_ = dict(zip(extended_headers, data))
            dict_.update(dict2_)
            return dict_

    def contents(self):
        """
        Get the contents of the sheet updated with 'status' and other columns

        :return:
        """
        f = FileUtils()
        sheet = Sheet.getInstance()
        headers, extended_headers, data = sheet.get_all_content()

        index, frozen_attachments_index, email_to_index, email_cc_index  = sheet.get_column_mappings_index(["index", "frozen_attachments", "to_column", "cc_column"])

        output_list = []
        for d in data:
            attachments = []
            if frozen_attachments_index and d[frozen_attachments_index]:
                attachment_list = f.sanitize_names_str(d[frozen_attachments_index])
                attachment_list = list(set(attachment_list))
                for a in attachment_list:
                    at_dict = {"name": a, "url": os.path.join("/attachment/file/", a)}
                    attachments.append(at_dict)
            
            email = {}
            email["index"] = d[index]
            email["from"] = Email.frm
            if email_to_index:
                email["to"] = d[email_to_index] 
            if email_cc_index:
                email["cc"] = d[email_cc_index] 
            if len(attachments) != 0:
                email["attachment"] = attachments
            if Email.subject_template:
                    sheet = Sheet.getInstance()
                    email["subject"] = sheet._template_to_str(Email.subject_template, d)
            if Email.body_template:
                    sheet = Sheet.getInstance()
                    email["body"] = sheet._template_to_str(Email.body_template, d)

            tmp = self._convert_header_data_list_to_dict(headers, extended_headers, d)

            tmp["email"] = email

            output_list.append(tmp)

        return (jsonify({'headers': headers, 'extended_headers': extended_headers, 'contents': output_list}),
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
        request.data
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

    def candidate(self):
        row = request.args.get("selected_row")
        row = json.loads(row)
        log.info("Find attachment candidate for row: %s", row)
        sheet = Sheet.getInstance()
        
        attachment_value = sheet.get_column_value(row, ['attachment_column'])
        log.info("Find attachment candidate for: %s", attachment_value)
        f = FileUtils()

        phrases = [
            'nursery',
            'kothrud',
            'balaji',
            'nagar',
            'junior',
            'kg',
            'jr',
            'kg',            
        ]
        candidates = f.find_n_files_by_fuzzymatch(flask_app.config['ATTACHMENTS_DIR'], attachment_value, ignore_phrases = phrases)

        return (jsonify({'pdfNames': candidates, 'subject': attachment_value}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('candidate/select', methods=['POST'])
    def select_candidate(self):
        data = json.loads(request.data)

        row = data['selected_row']
        selected_candidate = data['pdfName']

        sheet = Sheet.getInstance()
        current_frozen_attachments = sheet.get_column_value_from_data(row, 'frozen_attachments')
        if current_frozen_attachments != 'None':
            new_frozen_attachments = current_frozen_attachments + ',' + selected_candidate
        else:
            new_frozen_attachments = selected_candidate

        sheet.set_column_value(row, 'frozen_attachments', new_frozen_attachments)

        required_attachment_count = sheet.get_count_of_column_value_from_data(row, 'attachment_column')
        current_attachment_count = sheet.get_count_of_column_value_from_data(row, 'frozen_attachments')

        if current_attachment_count == required_attachment_count:
            sheet.set_column_value(row, 'status', 'Email Pending')

        return (jsonify({}), HTTP_OK, {'ContentType': 'application/json'})

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
        filename = data['filename']
        filepath = os.path.join(flask_app.config['ATTACHMENTS_DIR'], filename)
        
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
    email_provider_type = None

    @route('metadata_contents', methods=['POST'])
    def metadata_contents(self):
        """
        Specify email metadata content templates (subject, body)

        :return:
        """
        data = json.loads(request.data)
        log.info("Got email metadata: %s", data)
        Email.subject_template = data['subject_template']
        Email.body_template = data['body_template']

        return (jsonify({}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('server', methods=['POST'])
    def server_details(self):
        """
        SMTP server URL and credentials

        :return:
        """
        data = json.loads(request.data)

        assert len(data['username']) > 0 and len(data['password']) > 0, "username or password not provided"

        Email.frm = data['username']

        email_provider = EmailProvider()
        email_provider_type_class = email_provider.choose_email_provider("SMTP")
        EmailView.email_provider_type = email_provider_type_class("smtp.gmail.com", 587, data['username'], data['password'])
        EmailView.email_provider_type.login()
        
        return (jsonify({'error_message': ""}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    def _send_email(self, data, test_email = True):
        sheet = Sheet.getInstance()

        try:
            tos = []
            if (test_email):
                tos.append(Email.frm)
            else:
                tos.append(data['to'])

            ccs = []
            if (test_email):
                ccs.append(Email.frm)
            else:
                ccs.append(data['cc'])

            attachments = []
            at = data['attachment']
            for a in at:
                attachments.append(a["name"])

            Email.common_attachment_dir = flask_app.config['COMMON_ATTACHMENTS_DIR']
            e = Email(tos, ccs, attachments, data['subject'], data['body'])
            err = self.email_provider_type.send_email(e)

            if err[0] != 0:
                return (jsonify({"err_msg": err[1]}),
                        HTTP_BAD_INPUT,
                        {'ContentType': 'application/json'})

            sheet.set_column_value(data, 'status', 'Email Sent')
            return (jsonify({}),
                    HTTP_OK,
                    {'ContentType': 'application/json'})
        except:
            log.exception("Failed to send email")


    @route('send_test', methods=['POST'])
    def send_test(self):
        """
        Send a test email (metadata and actual content in payload)

        :return:
        """
        row = json.loads(request.data)

        return self._send_email(row)

    @route('send', methods=['POST'])
    def send(self):
        """
        Send a single email (metadata and actual content in payload)

        :return:
        """
        row = json.loads(request.data)

        return self._send_email(row, test_email = False)
        

    @route('template_to_reality', methods=['POST'])
    def template_to_reality(self):
        """
        Convert an email template (subject or body) by replacing column name placeholders with actual data

        :return:
        """
        template = json.loads(request.data)['template']

        sheet = Sheet.getInstance()
        result_str = sheet._template_to_str(template)

        return (jsonify({'reality': result_str}),
                HTTP_OK,
                {'ContentType': 'application/json'})


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