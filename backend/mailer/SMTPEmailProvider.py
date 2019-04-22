#!/usr/bin/env python
# coding=utf-8

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 
import os
import util.logger as logger
from mailer.EmailProvider import EmailProvider

log = logger.get_logger(__name__)

class SMTPEmailProvider(EmailProvider):
    def __init__(self, frm, server, port, username, password):
        EmailProvider.__init__(self)
        assert server is not None and port is not None and username is not None and password is not None,\
            log.error('server, port number, username or password is None')

        self.frm = frm
        self.server = server
        self.port = port
        self.username = username
        self.password = password
        self.s = None

    def logout(self):
        self.s.quit() 
        log.debug('emailapi teardown successful')

    # TODO Can you check if SMTPlib has different types of Exception (*Error) classes and write an except block for each?
    def login(self):
        # Connect to the SMTP server and login
        try:
            self.s = smtplib.SMTP(self.server, self.port)
            self.s.ehlo()
            self.s.starttls() 
            self.s.login(self.username, self.password) 

        except:
            log.exception('Incorrect server/user information provided')
            return [-1, 'Incorrect server/user information provided']

        log.debug('Login successful')
        return [0, 'Login successful']

    def send_email(self, e):
        try:
            # Extra <p> tags show up as multiple line breaks in the resulting email, so replace them
            # with single line breaks
            body = e.body.replace('</p><p>', '<br />')
            
            log.debug("Cleaned body: %s", body)
            
            msg = MIMEMultipart() 
            msg['From'] = self.frm
            msg['To'] = ", ".join(e.to)
            
            ccs_to_send = []
            if e.cc is not None and e.cc[0] != 'None':
                msg['Cc'] = ", ".join(e.cc)
                for cc in e.cc:
                    ccs_to_send.append(cc.strip())
            else:
                log.debug('No cc mailer provided')
            
            msg['Subject'] = e.subject
            msg.attach(MIMEText(e.body, 'html'))  
            
            if (e.attachment is not None):
                for attachment in e.attachment:
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
                self.s.sendmail(msg['From'], e.to + ccs_to_send, msg_str) 
            else:
                self.s.sendmail(msg['From'], e.to, msg_str) 
                log.info('Email sent by %s to %s' % (msg['From'], msg['To']))
            return [0, 'Email sent successfully']
        except:
            log.exception("Failed to send test email")