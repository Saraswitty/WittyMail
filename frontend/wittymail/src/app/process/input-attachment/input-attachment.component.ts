import { Component, OnInit } from '@angular/core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';

// TODO: Move this to the REST API service
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'app-input-attachment',
  templateUrl: './input-attachment.component.html',
  styleUrls: ['./input-attachment.component.css']
})
export class InputAttachmentComponent implements OnInit {

  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'attachments'});
  showDirectoryContents: boolean = false;
  numFiles: number = 23;

  constructor() { }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
         this.showDirectoryContents = true;
     };
  }

  onFilesSelected(event: any) {
    let files = [].slice.call(event.target.files);
    console.log("Selected files: " + files);
    this.numFiles = files.length;
    this.showDirectoryContents = true;
  }

}
