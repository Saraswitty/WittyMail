#!/usr/bin/env python
# coding=utf-8

import os, sys
sys.path.insert(0, os.path.abspath('..'))

# This should be the first import to bootstrap the runtime env
import util.bootstrap

import time, webbrowser, threading, traceback
import util.logger as logger
from werkzeug.serving import make_server

_logger = logger.get_logger(__name__)

FLASK_SERVER_PORT = "5000"

def parse_cmd_args():
    import argparse
    import util.version as version

    parser = argparse.ArgumentParser()
    pretty_version = version.__pretty_version__
    parser.add_argument("--version", "-v", action = 'version', version = pretty_version)
    parser.add_argument("--skip-opening-browser", "-s", action='store_true', default=False, help = 'Do not automatically open a browser window (only serve REST API)')
    args = parser.parse_args()

    _logger.debug("CLI args: %s", args)
    return args

def start_flask_server():
    # See wittymail_server/__init__.py for the Flask app bootstrap
    import wittymail_server
    flask_app = wittymail_server.flask_app
    
    flask_server = make_server("0.0.0.0", FLASK_SERVER_PORT, flask_app)
    flask_server.serve_forever()

def open_browser():
    print("A new browser window will open shortly, please wait...")
    # Wait for the HTTP server to start
    time.sleep(1)
    webbrowser.open("http://localhost:" + FLASK_SERVER_PORT)

def main():
    ''' Main entry point for WittyMail
        - Start the REST API server
        - Open a browser window with the GUI
    '''
    try:
        args = parse_cmd_args()

        if not args.skip_opening_browser:
            # Wait for a few seconds for the REST API server to start accepting
            # connections, then launch a browser with the URL for the GUI
            t = threading.Thread(target=open_browser)
            t.start()
        else:
            _logger.info("Open the following URL in a browser: http://localhost:%s", FLASK_SERVER_PORT)

        # This call will block forever
        start_flask_server()
        
    except Exception:
        _logger.exception("Failed to start the WittyMail GUI")
        sys.exit(1)
      
if __name__ == "__main__":
    main()
