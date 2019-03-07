# WittyMail
An automated personalized email composing solution that connects information from various sources to create a flexible workflow to send emails with attachments using SMTP from your own account.

## The Big Picture
Many non-profit organizations have started adopting tech for various common activities, such as engaging with sponsors via e-mails. These are not mass-marketing campaigns, but rather a medium to communicate information that each individual sponsor actually cares about, such as what their donations are being used for. These communications, by their nature, are personalized to the sponsor, the benefitiary or both and have a regular cadence that helps reinforce the relationship with the sponsor and encourage continued donations in the future.

In one particular case, an NGO that facilitates pre-school education for young, under-privileged kids wants to share the progress reports for the students that the sponsor has adopted. These progress reports are created on paper by local teachers bi-annually for each student. The NGO shares these progress reports (by scanning them into a PDF) with the sponsor for each student by sending them an email with the names of students they have adopted and their reports as attachments.

Although such organizations use cloud services like Google Sheets to maintain a master list of sponsors and their beneficiaries, they often involve human effort in mapping the names from this list, composing individual emails and attaching the right PDF.

**WittyMail** aims to automate this process by connecting the dots to create a flexible pipeline that can put all of the human effort in a for-loop and send hundreds of personalized emails in one click.

## Tech Stack
**WittyMail** is developed as a webapp with various deployment options, all featuring a GUI that can be accessed via a browser.

### Frontend
**Angular 6** using the VMware Clarity UI kit for the look and feel.

### Backend
**Python** using the Flask microframework for REST APIs (with a comically convoluted analogy). Uses several other Python modules to read .xlsx files, send emails via SMTP etc.

### Deployment
Packaging scripts for various deployment options are available:

- Single binary (packaged with PyInstaller)
- Hosted on a web server (Nginx and Gunicorn)

# Contributing
We use Github projects and issues to track features and bugs. Feel free to comment on any issue to get some context and then send us a pull request.

# License
This project is a part of SarasWitty, an organization that creates software solutions for non-profit organizations. We belive that our contributions here are a way to give back to the society that we live in and the applications of knowledge are free to use and build upon.

**WittyMail** uses the MIT license.