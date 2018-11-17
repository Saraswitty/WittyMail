import { Component, OnInit } from '@angular/core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';

// TODO: Move this to the REST API service
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'app-input-sheet',
  templateUrl: './input-sheet.component.html',
  styleUrls: ['./input-sheet.component.css']
})
export class InputSheetComponent implements OnInit {

  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'sheet' });
  showColumnSelectionForm: boolean = false;
  columnRoles: string[] =
    ["E-mail Address (To)",
      "E-mail Address (CC)",
      "Attachment PDF filename"]

  columnHeadersWithSamples = [
    {
      columnName: 'Name of Child',
      sampleValue: 'Peter Nelson',
      sampleValue2: 'Jenna Paulson'
    },
    {
      columnName: 'Class',
      sampleValue: 'Nur',
      sampleValue2: 'LKG'
    },
    {
      columnName: 'Sponsor',
      sampleValue: 'John Doe',
      sampleValue2: 'James May'
    },
    {
      columnName: 'Reference',
      sampleValue: 'Bob Jones',
      sampleValue2: 'Anna Peterson'
    },
    {
      columnName: 'Mail ID',
      sampleValue: 'john.doe@acme.com',
      sampleValue2: 'james.may@acme.com'
    }
  ];

  constructor() { }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log('ImageUpload:uploaded:', item, status, response);
      this.showColumnSelectionForm = true;
    };
  }

}
