import importlib
import pdb
#from mailer.SMTPEmailProvider import SMTPEmailProvider

class EmailProvider:
    def __init__(self):
        pass

    def choose_email_provider(self, name):
        from mailer.SMTPEmailProvider import SMTPEmailProvider
        return SMTPEmailProvider

    def login(self):
        raise NotImplementedError()
    def send_email(self):
        raise NotImplementedError()
    def logout(self):
        raise NotImplementedError()

