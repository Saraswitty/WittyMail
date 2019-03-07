#!/usr/bin/env python
# coding=utf-8

# Import this module as the first step in any entry-point Python module
# (which has a __main__ function) to bootstrap the runtime environment

# Initialize the logger
import util.logger as logger
logger.init_logger()

_logger = logger.get_logger(__name__)

def print_preamble():
    import util.version as version
    import os, sys, socket, platform, getpass

    # This also has the app name
    version_string = version.__pretty_version__
    working_dir = logger.WORKING_DIR
    runtime_path = logger.CURRENT_DIR
    log_file_path = logger.get_log_file_path()

    try:
        ip = socket.gethostbyname(socket.gethostname())
    except:
        ip = '<unknown>'
        
    try:
        hostname = socket.gethostname()
    except:
        hostname = '<unknown>'
    
    preamble = '''
{}
=============================
OS: {}
Python: {}
System: {} on {}/{}
Working directory: {}
Runtime path: {}
Commandline: {}
=============================
Log file: {}
=============================
    '''.format(version_string,
               platform.platform(),
               sys.version,
               getpass.getuser(), hostname, ip,
               working_dir,
               runtime_path,
               ' '.join(sys.argv),
               log_file_path)

    _logger.info(preamble)

# Try to print the preamble, but don't abort if something goes wrong
try:
    print_preamble()
except:
    _logger.exception("Failed to print preamble")
