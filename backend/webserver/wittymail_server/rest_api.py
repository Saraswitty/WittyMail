#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

import emailapi_broker
import tempfile
from wittymail_server import flask_app
import util.logger as logger
from flask import jsonify, request, json
import util.version as version
import util.logger as logger

log = logger.get_logger(__name__)

# These directories will be created within a tmp directory
ATTACHMENTS_DIRNAME = "attachment_dir/" # Dir to store email attachments
FODDER_DIRNAME      = "fodder_dir/"     # Dir to store fodder file

_logger = logger.get_logger(__name__)

HTTP_OK         = 200
HTTP_CREATED    = 201
HTTP_NOT_FOUND  = 404

@flask_app.route("/api/version", methods=['GET'])
def get_version():
  log.debug('Current version = %s' % (version.__pretty_version__))
  return (jsonify({'version': version.__pretty_version__}),
          HTTP_OK,
          {'ContentType':'application/json'})

@flask_app.route("/api/fodder", methods=['POST'])
def post_fodder():
  log.info(request.files)
  try:
    fodder_dir = os.path.join(tempfile.gettempdir(), FODDER_DIRNAME) 
    if not os.path.exists(fodder_dir):
      os.mkdir(fodder_dir) 

    f = request.files['fodder']
    fodder_file = os.path.join(fodder_dir, f.filename)
    f.save(fodder_file)
    log.info('fodder file saved as = %s' % (fodder_file))

    emailapi_broker.save_fodder_from_file(fodder_file)
  except:
    log.exception("Message")
  return "Data sheet saved successfully", HTTP_OK

@flask_app.route("/api/fodder/ingredients", methods=['GET'])
def get_fodder_ingredients():
  fodder_names = emailapi_broker.get_email_fodder_names()
  if len(fodder_names) == 0:
      return "Data sheet not yet provided", HTTP_NOT_FOUND

  return (jsonify(fodder_names),
          HTTP_OK,
            {'ContentType':'application/json'})

@flask_app.route("/api/attachment", methods=['POST'])
def post_attachment():
  attachments = request.files.getlist("attachment[]")

  attachment_dir = os.path.join(tempfile.gettempdir(), ATTACHMENTS_DIRNAME)
  if not os.path.exists(attachment_dir):
    os.mkdir(attachment_dir)

  for a in attachments:
    a.save(os.path.join(attachment_dir, a.filename))
    log.debug('attachment file save as = %s' % (attachment_dir + a.filename))

  emailapi_broker.save_attachment_dir(attachment_dir)
  return "Attachments saved successfully", HTTP_OK

@flask_app.route("/api/email", methods=['POST'])
def post_email():
  data = json.loads(request.data)
  emailapi_broker.save_extended_fodder(data['to_index'], data['cc_index'], data['subject_template'], data['body_template']) 
  return "Email related information saved successfully", HTTP_OK

@flask_app.route("/api/email/test", methods=['POST'])
def post_email_test():
  data = json.loads(request.data)
  e = emailapi_broker.send_email(data['to'])
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
    return e[1], HTTP_NOT_FOUND
  return e[1], HTTP_OK
