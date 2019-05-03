import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { LoggerService } from '../util/logger.service';
import { MatStepper } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
import { BackendService, AttachmentRotation, ColumnHeadersWithRowContent, CandidateAttachmentSelection, CandidateAttachments } from '../backend.service';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {

  @Input('mainStepper') mainStepper: MatStepper;
  @Input('stepper') stepper: MatStepper;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;
  
  public commonAttachmentUploader: FileUploader;
  public individualAttachmentUploader: FileUploader;

  /** List of strings, each being the heading text for a column */
  headers = [];

  /** Dict of columnHeaderName -> selectedMapping */
  columnSelectedAs = {};

  /** Data displayed in the table */
  sheetContents = [];

  selectedRow: any = null;
  selectedRowSubject: string = "";
  selectedPDF: any;

  attachmentCandidatesForSelectedRow: string[] = [];
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

  /**
   * Populate the table that displays the column headers and a few sample rows
   * 
   * This is called by the main stepper when this step becomes visible, because
   * the data fetching depends on previous steps.
   */
  populateTable() {
    this.backend.getSheetContents().subscribe(
      data => {
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent> data;

        /* Only show the first 4 columns as we have just half the page width for the table */
        this.headers = r.headers.slice(0, 3);

        /* Append the 'frozen_attachment' column */
        this.headers.concat(r.extended_headers);
        this.sheetContents = r.contents;
    
        this.log.info("Using %d headers and %d rows", this.headers.length, this.sheetContents.length);
      },
      error => {
        this.errorDialog.showError("Failed to get contents of the Excel sheet: " + error);
      }
    );
  }

  onStepChange(stepper: MatStepper) {
    this.log.info("Attachments page now showing step: ", stepper.selectedIndex);

    /* On the second step, populate the table with sheet contents */
    if (stepper.selectedIndex == 1) {
      this.populateTable();
    }
  }

  onClickRow(row) {
    this.log.info(row)
    this.selectedRow = row;

    this.backend.getCandidateAttachments(row).subscribe(
      data => {
        this.log.info("Got attachment candidates: ", data);
        let d: CandidateAttachments = <CandidateAttachments> data;
        this.attachmentCandidatesForSelectedRow = d.pdfNames;
        this.selectedRowSubject = d.subject;
      },
      error => {
        this.errorDialog.showError("Could not fetch any candidates for this row: " + error);
        this.attachmentCandidatesForSelectedRow = [];
      }
    );
  }

  onSelectAttachmentCandidate() {
    let payload: CandidateAttachmentSelection = {
      pdfName: this.selectedAttachmentCandidate,
      selected_row: this.selectedRow
    };

    this.log.info("Selecting candidate: ", payload);

    this.backend.selectAttachmentCandidate(payload).subscribe(
      data => {
        this.selectedRow = null;
      },
      error => {
        this.errorDialog.showError("Failed to select this candidate: " + error);
      }
    );
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
