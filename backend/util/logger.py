#!/usr/bin/env python
# coding=utf-8

'''Logging module
Provides APIs that are wrappers over the Python 'logging' module
'''

import logging, sys, traceback

_logger = None

LOG_LEVEL_IN_FILE = logging.DEBUG
LOG_LEVEL_ON_CONSOLE = logging.INFO

import os
LOG_FILE_PATH = os.path.join(os.path.abspath(os.getcwd()), 'wittymail_log.txt')

def init_logger():
    try:
        logging.basicConfig(filename=LOG_FILE_PATH, 
                            format='%(asctime)s %(threadName)s %(name)-12s %(levelname)-8s | %(message)s',
                            level=LOG_LEVEL_IN_FILE)

        # Add a logging handler to print all messages to the console (stdout)
        console_logger = logging.StreamHandler(sys.stdout)
        console_logger.setLevel(LOG_LEVEL_ON_CONSOLE)
        formatter = logging.Formatter('%(levelname)-8s | %(message)s')
        console_logger.setFormatter(formatter)

        root = logging.getLogger()
        root.addHandler(console_logger)
    except:
        import os
        traceback.print_exc()
        sys.stderr.write('Failed to initialize logger, aborting execution.\n')
        sys.stderr.write("Ensure that the current user has write permissions in this directory: {}\n".format(os.getcwd()))
        sys.exit(1)

def get_logger(module_name):
    '''
    Get an instance of a module-level logger
    
    :param module_name: Name of the calling module (use __name__)
    '''
    try:
        return logging.getLogger(module_name)
    except Exception as e:
        raise Exception("Failed to get the logger module name")

def get_log_file_path():
    return LOG_FILE_PATH
