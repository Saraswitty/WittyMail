import { Component, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from '../util/logger.service';
import { MatInput } from '@angular/material';

@Component({
  selector: 'app-email-design',
  templateUrl: './email-design.component.html',
  styleUrls: ['./email-design.component.css']
})
export class EmailDesignComponent implements OnInit {

  @ViewChild("subjectInput")
  subjectInput: MatInput;

  headers = ['Sr No.', 'Name of Child', 'Class', 'Sponsor', 'Mail ID', 'Reference', 'Reference Mail ID']
  
  sheetContents = [
    {
      'Sr No.': "1",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi",
      'Sponsor': "Kalubai pratishthan",
      'Mail ID': "Sanjaysandhu8090@gmail.com",
      'Reference': "Ravi",
      'Reference Mail ID': "amboreravi@gmail.com"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi",
      'Sponsor': "Kalubai pratishthan",
      'Mail ID': "Sanjaysandhu8090@gmail.com",
      'Reference': "Ravi",
      'Reference Mail ID': "amboreravi@gmail.com"
    },
    {
      'Sr No.': "3",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi",
      'Sponsor': "Kalubai pratishthan",
      'Mail ID': "Sanjaysandhu8090@gmail.com",
      'Reference': "Ravi",
      'Reference Mail ID': "amboreravi@gmail.com"
    },
  ];

  subjectTemplate: string = "";
  subjectSample: string = "This is the actual subject";

  bodyTemplate: string = ""
  bodySample: string = "";

  constructor(private log: LoggerService) { }

  ngOnInit() {
  }

  onClickColumn(columnName) {
    this.log.info("Selected column: %s", columnName);
    this.subjectTemplate += " {" + columnName + "} ";
  }

}
