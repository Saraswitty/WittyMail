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
      from: 'aaa',
      to: selectedEmail['to'],
      cc: selectedEmail['cc'],
      subject: selectedEmail['subject'],
      attachment: selectedEmail['attachment']['name'],
      attachment_url: selectedEmail['attachment']['url'],
      body: selectedEmail['body']
    }
    this.showEmailContentsModal = true;
  }

}
