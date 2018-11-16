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

  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'sheet'});
  showColumnSelectionForm: boolean = false;
  sheetHeaders: string[] = ['Column 1', 'Column 2', 'Column 3', 'Column 4']
  constructor() { }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
         this.showColumnSelectionForm = true;
     };
  }

}
