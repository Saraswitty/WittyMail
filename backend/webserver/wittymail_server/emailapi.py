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

# Boolean to make sure we do not try to send an email before login
INITIALIZED = False

# TODO Can you check if SMTPlib has different types of Exception (*Error) classes and write an except block for each?
def set_login_details(server, port, username, password):
  assert server is not None and port is not None and username is not None and password is not None,\
  log.error('server, port number, username or password is None')

  # s is a global object used to interact with the SMTP server
  global s

  # Connect to the SMTP server and login
  try:
    s = smtplib.SMTP(server, port)
    s.ehlo()
    s.starttls() 
    s.login(username, password) 

  except Exception as e:
     log.exception('Incorrect server/user information provided')
     return [-1, 'Incorrect server/user information provided']

  global INITIALIZED
  INITIALIZED = True
  log.debug('Login successful')
  return [0, 'Login successful']

def send_email(frm, tos, subject, body, ccs = None, attachments = None):
  assert                  \
  frm is not None and     \
  to is not None and      \
  subject is not None and  \
  body is not None, log.error('Incorrect value provided from=%s to=%s subject=%s body=%s'  
                              % (frm, to, subject, body))    

  if not INITIALIZED:
    log.error('send_email() called before set_login_details()')
    return [-1, "Server or user details not yet set"]

  log.debug('Email information: from=%s to=%s subject=%s body=%s cc=%s attachment=%s' 
            % (frm, to, subject[:50], body, cc, attachment))

  msg = MIMEMultipart() 
  msg['From'] = frm
  msg['To'] = ", ".join(tos)

  if cc is not None:
    msg['Cc'] = ", ".join(ccs)
  else:
    log.debug('No cc email provided')

  msg['Subject'] = subject
  msg.attach(MIMEText(body, 'plain'))  

  if (attachments is not None):
    for attachment in attachments:
      a = open(attachment, "rb")
      p = MIMEBase('application', 'octet-stream') 
      p.set_payload((a).read()) 
      encoders.encode_base64(p) 
      p.add_header('Content-Disposition', "attachment; filename= %s" % os.path.basename(attachment)) 
      msg.attach(p)

  msg_str = msg.as_string()
  s.sendmail(msg['From'], tos, msg_str) 
  log.info('Email sent by %s to %s' % (msg['From'], msg['To']))
  return [0, 'Email sent successfully']
  
def teardown():
  if not INITIALIZED:
    log.error('teardown() called before set_login_details()')
    return

  s.quit() 
  log.debug('emailapi teardown successful')
