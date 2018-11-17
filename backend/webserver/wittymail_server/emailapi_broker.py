#!/usr/bin/env python
# coding=utf-8

import openpyxl
import emailapi
import re
import util.logger as logger

log = logger.get_logger(__name__)

email_fodder_names = []
email_fodder = []

EMAIL_FODDER_TO_INDEX = 0 
EMAIL_FODDER_CC_INDEX = 0

extended_email_fodder_names = ['email_subject', 'email_body', 'email_attachment', 'email_sent']
extended_default_email_fodder = [None, None, None, False]

# TODO Add check to detect extention type
def save_fodder_from_file(loc, email_fodder_names_template = None):
    global email_fodder
    global email_fodder_names
   
    _email_fodder = []  

    # TODO Check if we should read wb_obj.active or wb_obj[0]
    wb_obj = openpyxl.load_workbook(loc)   
    sheet_obj = wb_obj.active

    for i in range(1, sheet_obj.max_row + 1):
        cells = []

        for j in range(1, sheet_obj.max_column + 1):
            cells.append(str(sheet_obj.cell(row = i, column = j).value).encode('UTF8'))
        _email_fodder.append(cells)

    assert email_fodder_names_template == None or email_fodder_names == email_fodder_names_template, \
           "**** The headers in the excel sheet seems to be invalid ****"
    assert len(_email_fodder) > 1,            \
           "**** There are no entries in the excel sheet! ****"

    email_fodder_names = _email_fodder[0]
    email_fodder_names.extend(extended_email_fodder_names)

    email_fodder = _email_fodder[1:]
    for r in email_fodder:
        extended_email_fodder = list(extended_default_email_fodder)
        extended_email_fodder[2] = r[1] + ".pdf"
        r.extend(extended_email_fodder)

def get_email_fodder_names():
    return email_fodder_names

def get_email_fodder():
    return email_fodder

def _template_to_str(_st, l):
  st = ''.join(_st)

  str_to_replace = list(set(re.findall(r'#\d+', st)))

  def remove_hash(s):
    return s[1:]

  index = map(int, [remove_hash(s) for s in str_to_replace])

  for i in range(len(index)):
    st = st.replace(str_to_replace[i], l[index[i]])

  return st

def save_extended_fodder(to_index, cc_index, subject_template, body_template):
    EMAIL_FODDER_TO_INDEX = to_index
    EMAIL_FODDER_CC_INDEX = cc_index

    for r in email_fodder:
        r[-4] = _template_to_str(subject_template, r)
        r[-3] = _template_to_str(body_template, r)

def save_attachment_dir(dir_loc, filename_mapping = None):
    global attachment_dir 
    attachment_dir = dir_loc

def send_email(to = None):
    for e in email_fodder:
        if not to:
            to = email_fodder[EMAIL_FODDER_TO_INDEX]
            cc = email_fodder[EMAIL_FODDER_CC_INDEX]
        else:
            cc = to

        email_subject = e[-4]
        email_body = e[-3]
        attachment = attachment_dir + e[-2]
        emailapi.send_email("ajaynair59@gmail.com", to, cc, email_subject, email_body, attachment)

def set_login_details(server, port, username, password):
    emailapi.set_login_details(server, port, username, password)
        
