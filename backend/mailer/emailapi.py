#!/usr/bin/env python
# coding=utf-8

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 
import os
import util.logger as logger
import pdb

log = logger.get_logger(__name__)

# Boolean to make sure we do not try to send an mailer before login
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

#subject = SerialNo 
def _test_values(frm, tos, subject, body, ccs, attachments):
  index = subject.split()[1]
  name_of_child = "Name Surname+" + index
  class_val = "Class+" + index
  sponsor_email_id = "ajaynair59+" + index + "@gmail.com"
  sponsor = "Sponsor Name+" + index
  reference = "Reference Name+" + index
  reference_email_id = "ajaynair59+" + index + "cc@gmail.com"
  test_attachment = name_of_child + ".pdf"

  tmpstr = index + " " + name_of_child + " " + class_val + " " + sponsor_email_id + " " + sponsor + " " + reference + " " + reference_email_id + " Name E-mail pending"
  test_subject = "Subject: " + tmpstr
  print(test_subject)

  test_body = "<p>Body: " + tmpstr + "</p>"
  print(test_body)

  assert test_subject == subject, "subject did not match"
  assert test_body == body, "body did not match"
  assert tos[0] == sponsor_email_id, "sponsor do not match"
  assert ccs[0] == reference_email_id, "CCs do not match"
  assert test_attachment in attachments[0] , "attachment do not match"

def send_email(frm, tos, subject, body, ccs = None, attachments = None):
    try:
        assert                   \
        frm is not None and      \
        tos is not None and      \
        subject is not None and  \
        body is not None, log.error('Incorrect value provided from=%s to=%s subject=%s body=%s'  
                                    % (frm, tos, subject, body))    
        
        # _test_values(frm, tos, subject, body, ccs, attachments)
        if not INITIALIZED:
          log.error('send_email() called before set_login_details()')
          return [-1, "Server or user details not yet set"]
        
        log.debug('Email information: from=%s to=%s subject=%s body=%s cc=%s attachment=%s' 
                  % (frm, tos, subject[:50], body, ccs, attachments))
        
        # Extra <p> tags show up as multiple line breaks in the resulting email, so replace them
        # with single line breaks
        body = body.replace('</p><p>', '<br />')
        
        log.debug("Cleaned body: %s", body)
        
        msg = MIMEMultipart() 
        msg['From'] = frm
        msg['To'] = ", ".join(tos)
        
        ccs_to_send = []
        if ccs is not None and ccs[0] != 'None':
          msg['Cc'] = ", ".join(ccs)
          for cc in ccs:
            ccs_to_send.append(cc.strip())
        else:
          log.debug('No cc mailer provided')
        
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))  
        
        if (attachments is not None):
          for attachment in attachments:
            if not os.path.isfile(attachment):
              return [-1, 'Attachment not found'] 
            try:
                a = open(attachment, "rb")
            except:
                log.exception("Failed to open attachment: %s", attachment)
                raise
            p = MIMEBase('application', 'octet-stream') 
            p.set_payload((a).read()) 
            encoders.encode_base64(p) 
            p.add_header('Content-Disposition', "attachment; filename= %s" % os.path.basename(attachment)) 
            msg.attach(p)
        
        msg_str = msg.as_string()
        log.debug("ccs_to_send: %s", ccs_to_send)
        if ccs_to_send:
          s.sendmail(msg['From'], tos + ccs_to_send, msg_str) 
        else:
          s.sendmail(msg['From'], tos, msg_str) 
        log.info('Email sent by %s to %s' % (msg['From'], msg['To']))
        return [0, 'Email sent successfully']
    except:
        log.exception("Failed to send test email")
  
def teardown():
  if not INITIALIZED:
    log.error('teardown() called before set_login_details()')
    return

  s.quit() 
  log.debug('emailapi teardown successful')
