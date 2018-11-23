import { Component, OnInit } from '@angular/core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService } from 'src/app/wittymail.service';

// TODO: Move this to the REST API service
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'app-input-sheet',
  templateUrl: './input-sheet.component.html',
  styleUrls: ['./input-sheet.component.css']
})
export class InputSheetComponent implements OnInit {

  public uploader: FileUploader;
  errorDialog = {
    show: false,
    message: ""
  } 
  showColumnSelectionForm: boolean = true;
  columnMappings: string[] = [];
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

  constructor(private log: LoggerService, private wittymail: WittymailService) { }

  displayColumnMappingUi() {
    this.showColumnSelectionForm = true;
  }

  sendColumnMapping() {
    this.log.info(this.columnMappings);
  }

  ngOnInit() {
    this.uploader = new FileUploader({ url: this.wittymail.getFodderUploadUrl(), itemAlias: 'fodder' });
    this.uploader.onAfterAddingFile = (file) => { 
      file.withCredentials = false;
      this.uploader.uploadAll();
    };
    
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.log.info('Fodder uploaded: ', item, status, response);
      if (status === 200) {
        this.displayColumnMappingUi();
      } else {
        this.errorDialog.message = "Failed to upload the sheet to the backend";
        this.errorDialog.show = true;
      }
    };
  }
}
