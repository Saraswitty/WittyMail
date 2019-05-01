from mailer.Email import Email
from mailer.EmailProvider import EmailProvider
import sys

'''
Basic Test1
-----------
1. Get username and password from CLI
2. Login using SMTP
3. Send a basic email
4. Logout
'''
def basic_test1(username, password):
    e = Email([username], [username], 'Subject', 'Body')
    eP = EmailProvider()
    selected_eP = eP.choose_email_provider("SMTP")
    seP = selected_eP(username, 'smtp.gmail.com', 587, username, password)
    seP.login()
    seP.send_email(e)
    seP.logout()

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("EmailProviderTest.py <username> <password>")

    username = sys.argv[1]
    password = sys.argv[2]
    basic_test1(username, password)