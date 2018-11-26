#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

import mailer.emailapi_broker as emailapi_broker
import tempfile
from wittymail_server import flask_app
from flask import jsonify, request, json
import util.version as version
import util.logger as logger

log = logger.get_logger(__name__)

# These directories will be created within a tmp directory
ATTACHMENTS_DIRNAME = "attachment_dir/" # Dir to store email attachments
FODDER_DIRNAME      = "fodder_dir/"     # Dir to store fodder file

# Actual temp directory, populated on first use
root_temp_dir = None

_logger = logger.get_logger(__name__)

HTTP_OK         = 200
HTTP_CREATED    = 201
HTTP_NOT_FOUND  = 404
HTTP_BAD_INPUT  = 400

def _get_root_temporary_dir():
    global root_temp_dir
    if not root_temp_dir:
        root_temp_dir = tempfile.mkdtemp(prefix="WittyMail_")
        _logger.info("Created new temporary directory: %s", root_temp_dir)
        
    return root_temp_dir
    
@flask_app.route("/api/version", methods=['GET'])
def get_version():
    log.debug('Current version = %s' % (version.__pretty_version__))
    return (jsonify({'version': version.__pretty_version__}),
              HTTP_OK,
              {'ContentType':'application/json'})
    
def _get_fodder_dir():
    fodder_dir = os.path.join(_get_root_temporary_dir(), FODDER_DIRNAME)
    if not os.path.exists(fodder_dir):
        os.mkdir(fodder_dir)
    
    return fodder_dir

@flask_app.route("/api/fodder", methods=['POST'])
def post_fodder():
    log.info(request.files)
    try:
        fodder_dir = _get_fodder_dir()

        f = request.files['fodder']
        fodder_file = os.path.join(fodder_dir, f.filename)
        f.save(fodder_file)
        log.info('fodder file saved as = %s' % (fodder_file))

        emailapi_broker.save_fodder_from_file(fodder_file)
    except:
        log.exception("Message")
    return "Data sheet saved successfully", HTTP_OK

# TODO Change this to a get request because using post for get is, well, stupid
# Check how to send multi line data in GET request 
@flask_app.route("/api/fodder/template", methods=['POST'])
def get_fodder_template():
    data = json.loads(request.data)
    fodder = emailapi_broker.get_email_fodder() 
    result_str = emailapi_broker.template_to_str(data['template'], fodder[0])
 
    return (jsonify(result_str),
              HTTP_OK,
                {'ContentType':'application/json'})

@flask_app.route("/api/fodder/ingredients", methods=['GET'])
def get_fodder_ingredients():
    fodder_names = emailapi_broker.get_email_fodder_names()
    if len(fodder_names) == 0:
        return "Data sheet not yet provided", HTTP_NOT_FOUND

    return (jsonify(fodder_names),
              HTTP_OK,
                {'ContentType':'application/json'})

def _get_attachments_dir():
    attachment_dir = os.path.join(_get_root_temporary_dir(), ATTACHMENTS_DIRNAME)
    if not os.path.exists(attachment_dir):
        os.mkdir(attachment_dir)
    
    return attachment_dir
    
@flask_app.route("/api/attachment", methods=['POST'])
def post_attachment():
    '''
    The 3rd party Angular plugin ng6-file-upload makes one POST call per file instead of 
    sending them all at once.
    
    To workaround this stupitidy, this API is idempotent and will just keep saving
    all files in the same dir
    '''
    try:
        a = request.files['attachment']
        attachment_dir = _get_attachments_dir()
    
        a.save(os.path.join(attachment_dir, a.filename))
        log.info('Attachment file saved as = %s' % (attachment_dir + a.filename))
    
        emailapi_broker.save_attachment_dir(attachment_dir)
        return "Attachments saved successfully", HTTP_OK
    except:
        _logger.exception("")

@flask_app.route("/api/email", methods=['POST'])
def post_email():
    data = json.loads(request.data)
    emailapi_broker.save_extended_fodder(data['to_column'], data['cc_column'], data['subject_template'], data['body_template']) 
    return "Email related information saved successfully", HTTP_OK

@flask_app.route("/api/email/test", methods=['POST'])
def post_email_test():
    data = json.loads(request.data)
    tos = []
    tos.append(data['to'])
    e = emailapi_broker.send_email(tos)
    if e[0] is not 0:
        return e[1], HTTP_NOT_FOUND
    return e[1], HTTP_OK

@flask_app.route("/api/email/send", methods=['POST'])
def post_email_send():
    data = json.loads(request.data)
    e = emailapi_broker.send_email()
    if e[0] is not 0:
        return e[1], HTTP_NOT_FOUND
    return e[1], HTTP_OK

@flask_app.route("/api/vomit", methods=['GET'])
def get_vomit():
    fodder_names = emailapi_broker.get_email_fodder_names()
    fodder = emailapi_broker.get_email_fodder()

    if len(fodder_names) == 0 or len(fodder) == 0:    
        return "Data sheet is empty or data sheet is not provided", HTTP_NOT_FOUND

    fodder_list = []
    for f in fodder:
        fodder_list.append(dict(zip(fodder_names, f)))

    return (jsonify({'fodder_list': fodder_list}),
              HTTP_OK,
              {'ContentType':'application/json'})

@flask_app.route("/api/email_server", methods=['POST'])
def post_email_server():
    data = json.loads(request.data)
    e = emailapi_broker.set_login_details(data['username'], data['password'])
    if e[0] is not 0:
        return (jsonify({'error_message': e[1]}),
              HTTP_BAD_INPUT,
              {'ContentType':'application/json'})
    return (jsonify({'error_message': e[1]}),
              HTTP_OK,
              {'ContentType':'application/json'})
