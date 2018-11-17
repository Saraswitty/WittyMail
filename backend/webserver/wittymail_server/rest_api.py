#!/usr/bin/env python
# coding=utf-8

import os, sys
import emailapi_broker
import tempfile
from wittymail_server import flask_app
import util.logger as logger
from flask import jsonify, request, json
import util.version as version

sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

# These directories will be created within a tmp directory
ATTACHMENTS_DIRNAME = "attachment_dir/" # Dir to store email attachments
FODDER_DIRNAME      = "fodder_dir/"     # Dir to store fodder file

_logger = logger.get_logger(__name__)

HTTP_OK         = 200
HTTP_CREATED    = 201
HTTP_NOT_FOUND  = 404

@flask_app.route("/api/version", methods=['GET'])
def get_version():
    return (jsonify({'version': version.__pretty_version__}),
            HTTP_OK,
            {'ContentType':'application/json'})

@flask_app.route("/api/fodder", methods=['POST'])
def post_fodder():
  fodder_dir = tempfile.gettempdir() + "/" + FODDER_DIRNAME
  if not os.path.exists(fodder_dir):
    os.mkdir(fodder_dir) 

  f = request.files['fodder']
  fodder_file = fodder_dir + f.filename
  f.save(fodder_file)

  try:
    emailapi_broker.save_fodder_from_file(fodder_file)
  except Exception as e:
    return e, HTTP_NOT_FOUND
  return "", HTTP_OK

@flask_app.route("/api/fodder/ingredients", methods=['GET'])
def get_fodder_ingredients():
    fodder_names = emailapi_broker.get_email_fodder_names()
    if len(fodder_names) == 0:
        return "Header not found", HTTP_NOT_FOUND

    return (jsonify(fodder_names),
            HTTP_OK,
            {'ContentType':'application/json'})

@flask_app.route("/api/attachment", methods=['POST'])
def post_attachment():
  attachments = request.files.getlist("attachment[]")

  attachment_dir = tempfile.gettempdir() + "/" + ATTACHMENTS_DIRNAME
  if not os.path.exists(attachment_dir):
    os.mkdir(attachment_dir)

  for a in attachments:
      a.save(attachment_dir + a.filename)

  emailapi_broker.save_attachment_dir(attachment_dir)
  return "", HTTP_OK

@flask_app.route("/api/email", methods=['POST'])
def post_email():
    data = json.loads(request.data)
    emailapi_broker.save_extended_fodder(data['to_index'], data['cc_index'], data['subject_template'], data['body_template']) 
    return "", HTTP_OK

@flask_app.route("/api/email/test", methods=['POST'])
def post_email_test():
    data = json.loads(request.data)
    emailapi_broker.send_email(data['to'])
    return "", HTTP_OK

@flask_app.route("/api/email/send", methods=['POST'])
def post_email_send():
    data = json.loads(request.data)
    emailapi_broker.send_email()
    return "", HTTP_OK

@flask_app.route("/api/vomit", methods=['GET'])
def get_vomit():
    fodder_names = emailapi_broker.get_email_fodder_names()
    fodder = emailapi_broker.get_email_fodder()

    if len(fodder_names) == 0 or len(fodder) == 0:    
        return "", HTTP_NOT_FOUND

    return (jsonify({'fodder_names': fodder_names, 'fodder': fodder}),
            HTTP_OK,
            {'ContentType':'application/json'})

@flask_app.route("/api/email_server", methods=['POST'])
def post_email_server():
    data = json.loads(request.data)
    try:
      emailapi_broker.set_login_details(data['smtp_server'], data['smtp_port'], data['username'], data['password'])
    except Exception as e:
        abort(403, error_message='Invalid server/user details provided')

    return "", HTTP_CREATED
