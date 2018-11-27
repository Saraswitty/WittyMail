import { Component, OnInit, ViewChild } from '@angular/core';
import { WittymailService, ColumnHeadersWithRowContent, TestEmailDetails } from 'src/app/wittymail.service';
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

  showTestEmailModal: boolean = false;
  testEmailDetails = {
    to_address: '',
    success: false,
    error: false,
    errorMessage: ''
  }

  constructor(private log: LoggerService, private wittymail: WittymailService) { }

  displaySummaryTable() {
    this.wittymail.getVomit().subscribe(
      data => {
        this.log.info("Vomit complete: ", data);
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent> data;
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
  }

  onViewEmail(selectedEmail) {
    this.log.info("Showing e-mail for: ", selectedEmail);
    this.emailDetails = {
      from: selectedEmail['from'],
      to: selectedEmail['to'],
      cc: selectedEmail['cc'],
      subject: selectedEmail['subject'],
      attachment: selectedEmail['attachment']['name'],
      attachment_url: selectedEmail['attachment']['url'],
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
    let d: TestEmailDetails = {
      to: this.testEmailDetails.to_address
    }
    this.wittymail.postTestEmail(d).subscribe(
      data => {
        this.testEmailDetails.success = true;
      },
      error => {
        this.testEmailDetails.errorMessage = error.error_message;
        this.testEmailDetails.error = true;
      }
    )
  }

  onSendAllEmails() {
    
  }
}
