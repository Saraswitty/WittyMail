#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

from wittymail_server import flask_app

from flask import send_file, send_from_directory

import util.logger as logger

_logger = logger.get_logger(__name__)

base_path = logger.WORKING_DIR

@flask_app.route("/")
def index():
    '''
    Serve the 'index.html' page by default
    '''
    return send_file(os.path.join(base_path, "static" , "index.html"))

@flask_app.route('/<path:path>')
def route_static_files(path):
    '''
    Serve all other supporting files (*.js, *.css etc.)
    '''
    return send_from_directory(os.path.join(base_path, "static"), path)

@flask_app.route('/attachment/<path:path>')
def route_attachment_files(path):
    return send_from_directory(flask_app.config['ATTACHMENTS_DIR'], path)

@flask_app.route('/sheet/<path:path>')
def route_fodder_file(path):
    return send_from_directory(flask_app.config['EXCEL_DIR'], path)