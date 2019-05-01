import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { BackendService } from '../backend.service';
import { LoggerService } from '../util/logger.service';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.css']
})
export class SponsorListComponent implements OnInit {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;
  public uploader: FileUploader;

  headers = ['Sr No.', 'Name of Child', 'Class', 'Sponsor', 'Mail ID', 'Reference', 'Reference Mail ID']
  columnSelectedAs = {
    'Sr No.': '',
    'Name of Child': 'Attachment Name',
    'Class': '',
    'Sponsor': '',
    'Mail ID': 'E-mail Address (To)',
    'Reference': '',
    'Reference Mail ID': 'E-mail Address (CC)'
  }
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

  constructor(private backend: BackendService, private log: LoggerService) { }

  ngOnInit() {
    this.uploader = new FileUploader({ url: this.backend.getFodderUploadUrl(), itemAlias: 'sponsor-sheet' });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      this.uploader.uploadAll();
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.log.info('Sponsor sheet uploaded: ', item.file.name, status);
      if (status === 200) {
        this.stepper.next();
        //this.displayColumnMappingUi();
      } else {
        this.errorDialog.showError("Failed to upload the sheet to the backend");
      }
    };
  }

}
