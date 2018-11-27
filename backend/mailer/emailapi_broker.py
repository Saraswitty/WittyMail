#!/usr/bin/env python
# coding=utf-8
import os, sys
import openpyxl
import mailer.emailapi as emailapi
import re
import util.logger as logger
import ai.gender_guesser as gender_guesser
import tempfile

log = logger.get_logger(__name__)

global email_fodder
global email_fodder_names
global EMAIL_FODDER_TO_INDEX
global EMAIL_FODDER_CC_INDEX
global attachment_dir 

# These directories will be created within a tmp directory
ATTACHMENTS_DIRNAME = "attachment_dir/" # Dir to store email attachments
FODDER_DIRNAME      = "fodder_dir/"     # Dir to store fodder file

# Actual temp directory, populated on first use
root_temp_dir = None

def _get_root_temporary_dir():
    global root_temp_dir
    if not root_temp_dir:
        root_temp_dir = tempfile.mkdtemp(prefix="WittyMail_")
        log.info("Created new temporary directory: %s", root_temp_dir)

    return root_temp_dir

def get_fodder_dir():
    fodder_dir = os.path.join(_get_root_temporary_dir(), FODDER_DIRNAME)
    if not os.path.exists(fodder_dir):
        os.mkdir(fodder_dir)

    return fodder_dir

def get_attachments_dir():
    attachment_dir = os.path.join(_get_root_temporary_dir(), ATTACHMENTS_DIRNAME)
    if not os.path.exists(attachment_dir):
        os.mkdir(attachment_dir)

    return attachment_dir

# Names of the fodder to be used to create the emails
email_fodder_names = []
# Fodder content used to create the emails
email_fodder = []

# Index of the emailid in the email_fodder_names[]. The emailid will be used in the 'to' field
EMAIL_FODDER_TO_INDEX = 0 
# Index of the emailid in the email_fodder_names[]. The emailid will be used in the 'cc' field
EMAIL_FODDER_CC_INDEX = 0

# Extended fodder names that will be appended to the fodder names provided by the user (i.e. email_fodder_names)
extended_email_fodder_names = ['pronoun', 'email_subject', 'email_body', 'email_attachment', 'email_sent']
email_fodder_names_STATUS_INDEX = -6
extended_email_fodder_names_PRONOUN_INDEX = -5
extended_email_fodder_names_EMAIL_SUBJECT_INDEX = -4
extended_email_fodder_names_EMAIL_BODY_INDEX = -3
extended_email_fodder_names_EMAIL_ATTACHMENT_INDEX = -2

# Extended fodder that will be appended to the fodder provided by the user (i.e. email_fodder[])
extended_default_email_fodder = ["his", None, None, None, False, "All is well"]

# TODO Add check to detect extention type
def save_fodder_from_file(loc, email_fodder_names_template = None):
        global email_fodder
        global email_fodder_names

        _email_fodder = []  

        # TODO Check if we should read wb_obj.active or wb_obj[0]. Do we have to close?
        wb_obj = openpyxl.load_workbook(loc)   
        sheet_obj = wb_obj.active

        for i in range(1, sheet_obj.max_row + 1):
            cells = []

            for j in range(1, sheet_obj.max_column + 1):
                cells.append(str(sheet_obj.cell(row = i, column = j).value))
            cells.append("E-mail pending") 
            _email_fodder.append(cells)

        assert email_fodder_names_template == None or email_fodder_names == email_fodder_names_template, \
               "**** The headers in the excel sheet seems to be invalid ****"
        assert len(_email_fodder) > 1,            \
               "**** There are no entries in the excel sheet! ****"

        email_fodder_names = _email_fodder[0]
        email_fodder_names = email_fodder_names[:-1]
        email_fodder_names.append("Status")

        email_fodder = _email_fodder[1:]
        

def get_email_fodder_names():
        return email_fodder_names

def get_email_fodder():
        return email_fodder

# #{no} in _st will be replaced by l[no]
def template_to_str(_st, l):
    log.debug('template_to_str() str = %s' % (_st))
    st = ''.join(_st)

    str_to_replace = list(set(re.findall(r'#\d+', st)))

    def remove_hash(s):
        return s[1:]

    index = map(int, [remove_hash(s) for s in str_to_replace])
    index = list(index)

    for i in range(len(index)):
        st = st.replace(str_to_replace[i], l[index[i] - 1])

    log.debug('template_to_str() final str = %s' % st)
    return st

def save_extended_fodder(to_column, cc_column, subject_template, body_template):
    global EMAIL_FODDER_TO_INDEX
    global EMAIL_FODDER_CC_INDEX

    EMAIL_FODDER_TO_INDEX = email_fodder_names.index(to_column)
    EMAIL_FODDER_CC_INDEX = email_fodder_names.index(cc_column)

    email_fodder_names.extend(extended_email_fodder_names)
    for r in email_fodder:
        name = r[1].split()
        # TODO: FixMe! "TypeError: can only concatenate str (not "bytes") to str"
        if len(name) == 1:
            gender = gender_guesser.guess_gender(name[0]) 
        else:
            gender = gender_guesser.guess_gender(name[0], name[1])
        r.extend(extended_default_email_fodder)
        r[extended_email_fodder_names_PRONOUN_INDEX] = "her" if gender == "female" else "his" 
        r[extended_email_fodder_names_EMAIL_SUBJECT_INDEX] = template_to_str(subject_template, r)
        r[extended_email_fodder_names_EMAIL_BODY_INDEX] = template_to_str(body_template, r)

def save_attachment_dir(dir_loc):
        global attachment_dir 
        attachment_dir = dir_loc

def save_attachment_column(attachment_column):
    attachment_index = email_fodder_names.index(attachment_column)
    for r in email_fodder:
        _attachments = r[attachment_index].split(',')
        attachments = [a + ".pdf" for a in _attachments]
        r[extended_email_fodder_names_EMAIL_ATTACHMENT_INDEX] = attachments
        for a in attachments:
            if not os.path.isfile(os.path.join(get_attachments_dir(), a)):
                r[email_fodder_names_STATUS_INDEX] = "pdf not found"
            else:
                r[email_fodder_names_STATUS_INDEX] = "All is well"

def send_email(tos = None):
    for e in email_fodder:
        if not tos:
            tos = email_fodder[EMAIL_FODDER_TO_INDEX].split(',')
            ccs = email_fodder[EMAIL_FODDER_CC_INDEX].split(',')
        else:
            log.debug('Test mail to be sent to+cc %s' % (''.join(tos)))
            ccs = tos

        email_subject = e[extended_email_fodder_names_EMAIL_SUBJECT_INDEX]
        email_body = e[extended_email_fodder_names_EMAIL_BODY_INDEX]

        attachment_list = e[extended_email_fodder_names_EMAIL_ATTACHMENT_INDEX].split(',')    
        attachments = [attachment_dir + a for a in attachment_list]

        return emailapi.send_email("ajaynair59@gmail.com", tos, email_subject, email_body, ccs, attachments)

def set_login_details(username, password, server="smtp.gmail.com", port=587):
    assert username is not None and password is not None,\
    log.error('server, port number, username or password is None')

    return emailapi.set_login_details(server, port, username, password)
