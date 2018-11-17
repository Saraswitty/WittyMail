import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {

  summaryList = [
    {childName: 'Peter Nelson',
     class: 'Nur',
     sponsor: 'John Doe',
     reference: 'Bob Jones',
    },
    {childName: 'Jenna Paulson',
     class: 'LKG',
     sponsor: 'James May',
     reference: 'Anna Peterson',
    }
  ];

  selectedRows = this.summaryList;

  constructor() { }

  ngOnInit() {
  }

}
