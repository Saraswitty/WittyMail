import { Component, OnInit, ViewChild } from '@angular/core';
import { WittymailService, ColumnHeadersWithRowContent, TestEmailDetails, SendEmailContent } from 'src/app/wittymail.service';
import { LoggerService } from 'src/app/util/logger.service';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {

  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  headers: string[] = [];
  tableContent: any[] = [];

  selectedRows = [];
  showEmailContentsModal: boolean = false;

  emailDetails = {};
  processedEmailsCount = 0;

  showTestEmailModal: boolean = false;
  testEmailDetails = {
    to_address: '',
    processing: false,
    success: false,
    error: false,
    errorMessage: ''
  }

  showSendAllEmailsModal: boolean = false;

  // Shown in the modal for viewing a single email, after clicking the 'send' button, as a status string
  sendEmailDetails = {
    processing: false,
    success: false,
    error: false,
    errorMessage: ''
  }

  sendAllEmails = {
    processing: false,
    done: false,
    success: true,
    error: false
  }

  downloadSheetUrl:string = '';

  constructor(private log: LoggerService, private wittymail: WittymailService) { }

  displaySummaryTable() {
    this.wittymail.getVomit().subscribe(
      data => {
        this.log.info("Vomit complete: ", data);
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent>data;
        this.headers = r.headers;
        this.tableContent = r.contents;
        // Select all rows by default
        this.selectedRows = this.tableContent;

        this.log.info("Got %d headers and %d rows", this.headers.length, this.tableContent.length);
      },
      error => {
        this.errorDialog.showError("Something really bad happened. Let's blame it on Ajay.");
      }
    );
  }

  ngOnInit() {
    this.displaySummaryTable();
    this.downloadSheetUrl = this.wittymail.getFodderDownloadUrl();
  }

  onViewEmail(selectedEmail) {
    this.log.info("Showing e-mail for: ", selectedEmail);
    this.emailDetails = {
      from: selectedEmail['from'],
      to: selectedEmail['to'],
      cc: selectedEmail['cc'],
      subject: selectedEmail['subject'],
      attachment: selectedEmail['attachment'],
      //attachment_name: selectedEmail['attachment']['name'],
      //attachment_url: selectedEmail['attachment']['url'],
      body: selectedEmail['body']
    }
    this.showEmailContentsModal = true;
  }

  onSendTestEmail() {
    this.testEmailDetails.success = false;
    this.testEmailDetails.error = false;
    this.showTestEmailModal = true;
  }

  sendTestEmail() {
    this.log.info("Sending test e-mail to '", this.testEmailDetails.to_address);
    this.testEmailDetails.processing = true;
    let d: TestEmailDetails = {
      to: this.testEmailDetails.to_address
    }
    this.wittymail.postTestEmail(d).subscribe(
      data => {
        this.testEmailDetails.processing = false;
        this.testEmailDetails.success = true;
      },
      error => {
        this.testEmailDetails.processing = false;
        this.testEmailDetails.errorMessage = error.error_message;
        this.testEmailDetails.error = true;
      }
    )
  }

  sendEmail(email_contents: any, is_single: boolean) {
    this.log.info("Sending e-mail: ", email_contents);
    this.sendEmailDetails.processing = true;
    let d: SendEmailContent = {
      from: email_contents['from'],
      to: email_contents['to'],
      cc: email_contents['cc'],
      subject: email_contents['subject'],
      attachment: email_contents['attachment'],
      body: email_contents['body']
    }
    this.wittymail.postSendEmail(d).subscribe(
      data => {
        this.log.info("Email sent successfully");
        if (is_single) {
          this.sendEmailDetails.processing = false;
          this.sendEmailDetails.success = true;
        } else {
          this.processedEmailsCount += 1;
          if (this.processedEmailsCount == this.selectedRows.length) {
            this.log.info("Finished processing all emails");
            this.sendAllEmails.done = true;
            this.sendAllEmails.processing = false;
          }
        }
      },
      error => {
        this.log.error("Failed to send email");
        if (is_single) {
          this.sendEmailDetails.processing = false;
          this.sendEmailDetails.errorMessage = error.error_message;
          this.sendEmailDetails.error = true;
        } else {
          this.log.error("Failed to send one email in bulk mode");
          this.sendAllEmails.error = true;
          this.processedEmailsCount += 1;
          if (this.processedEmailsCount == this.selectedRows.length) {
            this.log.info("Finished processing all emails");
            this.sendAllEmails.processing = false;
            this.sendAllEmails.done = true;
          }
        }
      }
    )
  }

  sendSelectedEmails() {
    this.log.info("Sending selected emails: ", this.selectedRows.length);
    this.sendAllEmails.processing = true;
    for (let row of this.selectedRows) {
      this.sendEmail(row['email'], false);
    }
  }

  onSendAllEmails() {
    this.showSendAllEmailsModal = true;
  }
}
