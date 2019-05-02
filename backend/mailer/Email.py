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

class Email():
  subject_template = None
  body_template = None
  frm = None

  def __init__(self, to, cc, subject, body, status = None):
    assert to is not None and                   \
        cc is not None,                         \
        log.error('Incorrect value provided to=%s cc=%s' % (to, cc))
    self.to = to
    self.cc = cc
    self.subject = subject
    self.body = body
    self.status = status
    self.attachment = None

  def get_email_from(self):
    return self.frm

  def __del__(self):
    self.to = None
    Email.subject_template = None
    Email.body_template = None