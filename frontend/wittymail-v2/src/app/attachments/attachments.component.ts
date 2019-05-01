import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { LoggerService } from '../util/logger.service';
import { MatStepper } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
import { BackendService } from '../backend.service';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {

  @Input('mainStepper') mainStepper: MatStepper;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;
  
  public commonAttachmentUploader: FileUploader;
  public individualAttachmentUploader: FileUploader;
  
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
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
      'Class': "Nursery-kalewadi"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Vedika Shirgire",
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
  selectedPDFViewerHTML: SafeHtml = null;

  constructor(private sanitizer: DomSanitizer, private log: LoggerService,
    private backend: BackendService) { }

  ngOnInit() {
    this.commonAttachmentUploader = new FileUploader({ url: this.backend.getAttachmentUploadUrl(), itemAlias: 'common_attachment' });
    this.individualAttachmentUploader = new FileUploader({ url: this.backend.getAttachmentUploadUrl(), itemAlias: 'attachment' });
    let uploaders = [this.commonAttachmentUploader, this.individualAttachmentUploader];
    
    uploaders.forEach(uploader => {
      uploader.onAfterAddingFile = (file) => {
        file.withCredentials = false;
        uploader.uploadAll();
      };

      uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        if (status == 200) {
          this.log.info("Attachment uploaded: ", item.file.name, status);
        } else {
          this.errorDialog.showError("Failed to upload attachment '" + item.file.name + "': " + status + " " + response);
        }
      };
    });
  }

  onClickRow(row) {
    this.log.info(row)
    this.log.info(row[this.attachmentSubjectHeaderName])
    this.selectedRow = row;
  }

  onSelectCandidatePDF(candidate) {
    this.log.info(candidate);

    let pdfurl = "https://pdfobject.com/pdf/sample-3pp.pdf";

    this.selectedPDFViewerHTML = this.sanitizer.bypassSecurityTrustHtml(
      "<object style='width: 100%;height: 100%' data='" + pdfurl + "' type='application/pdf' class='embed-responsive-item'>" +
      "Object " + pdfurl + " failed" +
      "</object>");
  }

}
