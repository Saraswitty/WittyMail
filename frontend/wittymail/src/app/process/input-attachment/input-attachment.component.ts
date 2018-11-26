import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService } from 'src/app/wittymail.service';
import { Router } from '@angular/router';

// TODO: Move this to the REST API service
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'app-input-attachment',
  templateUrl: './input-attachment.component.html',
  styleUrls: ['./input-attachment.component.css']
})
export class InputAttachmentComponent implements OnInit {

  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  public uploader: FileUploader;
  showDirectoryContents: boolean = false;
  numFiles: number = 23;

  constructor(private log: LoggerService,
    private wittymail: WittymailService,
    private router: Router) { }

  ngOnInit() {
    this.uploader = new FileUploader({ url: this.wittymail.getAttachmentUploadUrl(), itemAlias: 'attachment' });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      this.uploader.uploadAll();
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.log.info("Attachment uploaded: ", item.file.name, status);
      this.showDirectoryContents = true;
    };
  }

  onFilesSelected(event: any) {
    let files = [].slice.call(event.target.files);
    console.log("Selected files: " + files);
    this.numFiles = files.length;
    this.showDirectoryContents = true;
  }

  validateInputsAndContinue() {
    // TODO: Call REST API to fetch missing PDFs
    this.router.navigate(['design-contents']);
  }

}
