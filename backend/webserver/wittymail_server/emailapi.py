#!/usr/bin/env python
# coding=utf-8

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 
import os
import util.logger as logger

log = logger.get_logger(__name__)

INITIALIZED = False

def set_login_details(server, port, username, password):
  global s
  try:
    s = smtplib.SMTP(server, port)
    s.ehlo()
    s.starttls() 
    s.login(username, password) 
  except Exception as e:
    raise Exception("Invalid server/user details provided")

  global INITIALIZED
  INITIALIZED = True
  log.debug('emailapi initialized successfully')

def send_email(frm, to, cc, subject, body, attachment = None):
  if not INITIALIZED:
    log.error('Email cannot be sent before emailapi is initialized')
    return

  # assert to, subject, body is not None or empty
  msg = MIMEMultipart() 
  msg['From'] = frm
  msg['To'] = to
  msg['Cc'] = cc
  msg['Subject'] = subject
  msg.attach(MIMEText(body, 'plain'))  

  if (attachment is not None):
    log.debug('No attachment found')
    a = open(attachment, "rb")

    p = MIMEBase('application', 'octet-stream') 
    p.set_payload((a).read()) 
    encoders.encode_base64(p) 
    p.add_header('Content-Disposition', "attachment; filename= %s" % os.path.basename(attachment)) 
    msg.attach(p)

  msg_str = msg.as_string()
  s.sendmail(msg['From'], msg['To'], msg_str) 
  log.debug('Email sent')
  
def teardown():
  if not INITIALIZED:
    log.error('Email cannot be sent before emailapi is initialized')
    return

  s.quit() 
  log.debug('emailapi teardown successful')
