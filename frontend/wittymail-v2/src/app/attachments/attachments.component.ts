import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {

  headers = ['Sr No.', 'Name of Child', 'Class']
  attachmentSubjectHeaderName = 'Name of Child'
  sheetContents = [
    {
      'Sr No.': "1",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    }
  ];
  selectedRow: any = null;

  attachmentCandidatesForSelectedRow = [
    {
      'id': 12345,
      'displayName': "Aradhya Karche.pdf"
    },
    {
      'id': 12346,
      'displayName': "Aaradhya Karche.pdf"
    },
    {
      'id': 12347,
      'displayName': "Aradhya Kachre.pdf"
    }
  ]
  selectedAttachmentCandidate: any = null;


  constructor() { }

  ngOnInit() {
  }

  onClickRow(row) {
    console.log(row)
    console.log(row[this.attachmentSubjectHeaderName])
    this.selectedRow = row;
  }

  onSelectCandidatePDF(candidate) {
    console.log(candidate);
  }

}
