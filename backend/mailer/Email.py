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
  common_attachment_dir = None

  def __init__(self, tos, ccs, attachments, subject, body, status = None):
    assert tos is not None, log.error('Incorrect value provided to=%s cc=%s' % (tos, ccs))
    self.tos = tos
    self.ccs = ccs
    self.attachments = attachments
    self.subject = subject
    self.body = body
    self.status = status

  def get_email_from(self):
    return Email.frm

  def set_email_frm(self, frm):
    Email.frm = frm

  def set_email_common_attachment_dir(self, attachment_dir):
    Email.common_attachment_dir = attachment_dir

  def __del__(self):
    self.to = None
    Email.subject_template = None
    Email.body_template = None