#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

from wittymail_server import flask_app
import util.logger as logger

_logger = logger.get_logger(__name__)

from flask import jsonify, request

@flask_app.route("/api/version", methods=['GET'])
def get_version():
    return (jsonify({'version': '0.1.0'}),
            200,
            {'ContentType':'application/json'})
