#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

from wittymail_server import flask_app
import util.logger as logger

_logger = logger.get_logger(__name__)

from flask import jsonify, request
import util.version as version

headers =                   \
[                           \
'S.No',                     \
'Name of Child',            \
'Class',                    \
'Sponsor',                  \
'Reference',                \
'Sponsor Mail Id',          \
'Reference Mail Id'         \
'email subject',            \
'email body',               \
'attachment',               \
'has_sent_mail',            \
]                           

data =                      \
[                           \
[                           \
'1',                        \
'Avani Kulkarni'            \
'Nur',                      \
'Amit Shah',                \
'Sumit Kumar',              \
'amit.shah@gmail.com'       \
'sumit.kumar@gmail.com'     \
'Report card'               \
'Hello Amit,\nPlease see attached the report card\nThanks,\nSneh Foundation\n' \
'avani.kulkarni.pdf',       \
False,                      \
],                          \
[                           \
'2',                        \
'Bhavani Shah'              \
'Senior',                   \
'Amar Shinde',              \
'Sunil krishna',            \
'amar.shinde@gmail.com'     \
'sunilkrishna@gmail.com'    \
'Report card'               \
'Hello Amar,\nPlease see attached the report card\nThanks,\nSneh Foundation\n' \
'bhavani.shah.pdf',         \
False,                      \
]                           \
]

# TODO Add comments to each function

@flask_app.route("/api/version", methods=['GET'])
def get_version():
    return (jsonify({'version': version.__pretty_version__}),
            200,
            {'ContentType':'application/json'})

@flask_app.route("/api/fodder", methods=['POST'])
def post_fodder():
  return "", 200

@flask_app.route("/api/fodder/ingredients", methods=['GET'])
def get_fodder_ingredients():
    return (jsonify(headers),
            200,
            {'ContentType':'application/json'})

@flask_app.route("/api/attachment", methods=['POST'])
def post_attachment():
    return "", 200

@flask_app.route("/api/email", methods=['POST'])
def post_email():
    return "", 200

@flask_app.route("/api/email/test", methods=['POST'])
def post_email_test():
    return "", 200

@flask_app.route("/api/email/send", methods=['POST'])
def post_email_send():
    return "", 200

@flask_app.route("/api/vomit", methods=['GET'])
def get_vomit():
    return (jsonify({'headers': headers, 'data': data}),
            200,
            {'ContentType':'application/json'})

@flask_app.route("/api/email_server", methods=['POST'])
def post_email_server():
    return "", 201
