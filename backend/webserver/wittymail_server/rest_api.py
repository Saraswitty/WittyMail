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

log = logger.get_logger(__name__)

HTTP_OK         = 200
HTTP_CREATED    = 201
HTTP_NOT_FOUND  = 404
HTTP_BAD_INPUT  = 400

class SheetView(FlaskView):
    """
    APIs for the sheet containing sponsor/beneficiary details

    /api/sheet/...
    """
    s = Sheet(None)
    route_prefix = flask_app.config['URL_DEFAULT_PREFIX_FOR_API']

    @route('upload', methods=['POST'])
    def upload(self):
        """
        Upload a new Excel sheet as input

        :return:
        """
        log.debug("Uploading sheet: %s", request.files)
        fodder_dir = flask_app.config['FODDER_DIR']

        f = request.files['sponsor-sheet']
        fodder_file = os.path.join(fodder_dir, f.filename)
        f.save(fodder_file)
        log.info('Sheet file saved as: %s', fodder_file)

        # Parse the Excel sheet and store the contents in-memory
        emailapi_broker.save_fodder_from_file(fodder_file)

        return (jsonify({}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    def file(self):
        """
        Get the Excel sheet (*.xlsx file) updated with 'status' and other columns

        :return:
        """
        fodder_file = emailapi_broker.save_fodder_to_file()
        log.info("Send sheet back to frontend: %s", fodder_file)

        return send_file(fodder_file)

    def contents(self):
        """
        Get the contents of the sheet updated with 'status' and other columns

        :return:
        """
        log.info("URL: %s", url_for('SheetView:some'))
        e = emailapi_broker.get_email_fodder_names()
        if e[0] is not 0:
            return (jsonify({"err_msg": e[1]}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        fodder_names = e[1]

        if emailapi_broker.email_from == None:
            return (jsonify({"err_msg": "Login details not yet provided"}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        fodder = emailapi_broker.get_email_fodder()
        extended_fodder = emailapi_broker.get_extended_email_fodder()

        if len(fodder_names) == 0 or len(fodder) == 0 or len(extended_fodder) == 0:
            return (jsonify({'error_message': "Data sheet or email template not provided"}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        assert len(fodder) == len(extended_fodder), "Count of fodder and extended_fodder do not match"

        if emailapi_broker.EMAIL_FODDER_TO_INDEX == None or emailapi_broker.EMAIL_FODDER_CC_INDEX == None:
            return (jsonify({'error_message': "'To' or 'CC' index not provided"}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        # Create fodder_list in email_broker
        fodder_list = []
        for f, e in zip(fodder, extended_fodder):
            at = []
            for a in e[-2]:
                at_dict = {"name": a, "url": os.path.join("/attachment/", a)}
                at.append(at_dict)
            email = { \
                "from": emailapi_broker.email_from,
                "to": f[emailapi_broker.EMAIL_FODDER_TO_INDEX],
                "cc": f[emailapi_broker.EMAIL_FODDER_CC_INDEX],
                "attachment": at,
                "subject": e[-4],
                "body": e[-3],
            }

            tmp = dict(zip(fodder_names, f))
            tmp["email"] = email
            fodder_list.append(tmp)

        return (jsonify({'headers': fodder_names, 'contents': fodder_list}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    def headers(self):
        """
        Get the header row in the Excel sheet with the first 3 rows as sample values

        :return:
        """
        e = emailapi_broker.get_email_fodder_names()
        if e[0] is not 0:
            return (jsonify({"err_msg": e[1]}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        fodder_names = e[1]
        fodder = emailapi_broker.get_email_fodder()

        if len(fodder_names) == 0 or len(fodder) == 0:
            return (jsonify({"err_msg": "Data sheet is empty or not provided"}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        cnt = 0
        fodder_list = []
        for f in fodder:
            if cnt == 2:
                break
            fodder_list.append(dict(zip(fodder_names, f)))
            cnt += 1

        if cnt == 0:
            return (jsonify({'error_message': "Data sheet is empty or data sheet is not provided"}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

        return (jsonify({'headers': fodder_names, 'contents': fodder_list}),
                HTTP_OK,
                {'ContentType': 'application/json'})

    @route('mapping', methods=['POST'])
    def mapping(self):
        """
        Specify the mapping of columns in the Excel sheet to targets (eg. attachment names)

        :return:
        """
        data = json.loads(request.data)
        emailapi_broker.save_attachment_column(data['attachment_column'])
        return (jsonify({}),
                HTTP_OK,
                {'ContentType': 'application/json'})

class AttachmentView(FlaskView):
    """
    APIs for attachments to be used with the Sheet (by mapping) and sent with emails
    """
    route_prefix = flask_app.config['URL_DEFAULT_PREFIX_FOR_API']

    @route('upload', methods=['POST'])
    def upload_attachment(self):
        """
        The 3rd party Angular plugin ng6-file-upload makes one POST call per file instead of
        sending them all at once.

        To workaround this stupidity, this API is idempotent and will just keep saving
        all files in the same dir
        """
        a = request.files['attachment']
        attachment_dir = flask_app.config['ATTACHMENTS_DIR']

        a.save(os.path.join(attachment_dir, a.filename))
        log.info('Attachment file saved as = %s' % (attachment_dir + a.filename))

        emailapi_broker.save_attachment_dir(attachment_dir)
        # TODO Call change_email_fodder_status() from save_attachment_dir()
        emailapi_broker.change_email_fodder_status(a.filename)
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
        emailapi_broker.change_email_fodder_status(a.filename, data['row'])
        return "Attachments saved successfully", HTTP_OK

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

        e = emailapi_broker.set_login_details(data['username'], data['password'])

        if e[0] is not 0:
            return (jsonify({'error_message': e[1]}),
                    HTTP_BAD_INPUT,
                    {'ContentType': 'application/json'})

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
        Soecify email metadata (to, cc etc.) and content templates (subject, body)

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
    

# The below APIs are never called by the GUI, who knows what they are for? #############################################

@flask_app.route("/api/fodder/ingredients", methods=['GET'])
def get_fodder_ingredients():
    e = emailapi_broker.get_email_fodder_names()
    if e[0] is not 0:
        return (jsonify({"err_msg": e[1]}),
            HTTP_BAD_INPUT,
            {'ContentType':'application/json'})

    fodder_names = e[1]    
    if len(fodder_names) == 0:
           return (jsonify({'error_message': "Data sheet is empty or data sheet is not provided"}),
                  HTTP_BAD_INPUT,
                  {'ContentType':'application/json'})

    return (jsonify(fodder_names),
            HTTP_OK,
            {'ContentType':'application/json'})


@flask_app.route("/api/attachment/validate", methods=['GET'])
def get_attachment_validate():
  e = emailapi_broker.get_email_fodder_names()
  if e[0] is not 0:
    return (jsonify({"err_msg": e[1]}),
            HTTP_BAD_INPUT,
            {'ContentType':'application/json'})

  fodder_names = e[1]  
  
  fodder = emailapi_broker.get_email_fodder()

  if len(fodder_names) == 0 or len(fodder) == 0:    
    return (jsonify({'error_message': "Data sheet is empty or data sheet is not provided"}),
            HTTP_BAD_INPUT,
            {'ContentType':'application/json'})

  issue_index = fodder_names.index("status")

  fodder_list = []
  for f in fodder:
      if f[issue_index] != "All is well":
        fodder_list.append(dict(zip(fodder_names, f)))

  return (jsonify({'headers': fodder_names, 'content': fodder_list}),
            HTTP_OK,
            {'ContentType':'application/json'})
