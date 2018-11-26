import { Component, OnInit } from '@angular/core';
import { WittymailService, ColumnHeadersWithRowContent } from 'src/app/wittymail.service';
import { LoggerService } from 'src/app/util/logger.service';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {

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
    let r: ColumnHeadersWithRowContent = this.wittymail.getVomit();
    this.headers = r.headers;
    this.tableContent = r.contents;
    // Select all rows by default
    this.selectedRows = this.tableContent;

    this.log.info("Got %d headers and %d rows", this.headers.length, this.tableContent.length);
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
    this.log.info("Sending test e-mail to '", this.testEmailDetails.to_address, "' for: ", this.tableContent[0]);
    this.testEmailDetails.success = true;
  }

}
