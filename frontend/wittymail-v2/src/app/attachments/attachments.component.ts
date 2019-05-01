import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { LoggerService } from '../util/logger.service';
import { MatStepper } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
import { BackendService, AttachmentRotation } from '../backend.service';
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

  selectedPDF: any;
  
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
      'pdfName': "Aradhya Karche.pdf"
    },
    {
      'pdfName': "Aaradhya Karche.pdf"
    },
    {
      'pdfName': "Aradhya Kachre.pdf"
    }
  ]
  selectedAttachmentCandidate: any = null;
  selectedPDFViewerHTML: SafeHtml = null;

  constructor(private sanitizer: DomSanitizer, private log: LoggerService,
    private backend: BackendService, private location: Location, private platformLocation:PlatformLocation) { }

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

  _setPDFViewerHTML(url) {
    /* Sanitize the relative URL to the backend */
    url = this.location.prepareExternalUrl(url);

    /* Cache buster, because the rotated PDF will have the same name */
    url += "?" + Math.random()

    /* Prepare the absolute URL to be used in the HTML */
    let absolute_url = (this.platformLocation as any).location.origin + url;

    this.selectedPDFViewerHTML = this.sanitizer.bypassSecurityTrustHtml(
      "<object style='width: 100%;height: 100%' data='" + absolute_url + "' type='application/pdf' class='embed-responsive-item'>" +
      "Failed to load PDF: " + absolute_url + "</object>");
  }

  onSelectCandidatePDF(candidate) {
    this.log.info("Showing PDF for: ", candidate.pdfName);
    this.selectedPDF = candidate;
    this._setPDFViewerHTML(this.backend.urls.attachment.get_file + candidate.pdfName);
  }

  onClickRotate(direction: string) {
    let rotation: AttachmentRotation = {
      filename: this.selectedPDF.pdfName,
      direction: direction
    };

    this.log.info("Rotating ", rotation);

    this.backend.rotateAttachment(rotation).subscribe(
      data => {
        this.log.info("Rotation successful, reloading...");
        this.onSelectCandidatePDF(this.selectedPDF);
      },
      error => {
        this.errorDialog.showError("Failed to rotate PDF: " + error);
      }
    );
  }

}
