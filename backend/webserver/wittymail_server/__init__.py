#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.append(os.path.abspath(os.path.join(os.curdir, '..', '..')))

import traceback
import tempfile

# 3rd party imports
try:
    from flask import Flask
    from flask_cors import CORS, cross_origin
except Exception as e:
    sys.stderr.write("Failed to import some Python modules, use requirements.txt "
                 "to install 3rd party external dependencies: {}".format(e))
    traceback.print_exc()
    sys.exit(1)

# Internal imports
import util.logger as logger

_logger = logger.get_logger(__name__)

# Actual temp directory, populated on first use
root_temp_dir = None

# These directories will be created within a tmp directory
ATTACHMENTS_DIRNAME = "attachment_dir" # Dir to store email attachments
FODDER_DIRNAME      = "fodder_dir"     # Dir to store fodder file

def _get_root_temporary_dir():
    global root_temp_dir
    if not root_temp_dir:
        root_temp_dir = tempfile.mkdtemp(prefix="WittyMail_")

    return root_temp_dir

def get_fodder_dir():
    fodder_dir = os.path.join(_get_root_temporary_dir(), FODDER_DIRNAME)
    if not os.path.exists(fodder_dir):
        os.mkdir(fodder_dir)

    return fodder_dir

def get_attachments_dir():
    attachment_dir = os.path.join(_get_root_temporary_dir(), ATTACHMENTS_DIRNAME)
    if not os.path.exists(attachment_dir):
        os.mkdir(attachment_dir)

    return attachment_dir

try:
    # Create the Flask app and init config
    flask_app = Flask('wittymail')

    # Need Cross-origin headers for local development
    CORS(flask_app)

    a = get_attachments_dir()
    f = get_fodder_dir()

    flask_app.config['ATTACHMENTS_DIR'] = a
    flask_app.config['FODDER_DIR'] = f

    # Import other Flask sub-modules containing URL handlers
    import wittymail_server.default_routes
    import wittymail_server.rest_api
except:
    _logger.exception("WittyMail REST API startup failed")
    sys.exit(1)
