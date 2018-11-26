import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService, ColumnHeadersWithRowContent, ColumnMappings } from 'src/app/wittymail.service';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

// TODO: Move this to the REST API service
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'app-input-sheet',
  templateUrl: './input-sheet.component.html',
  styleUrls: ['./input-sheet.component.css']
})
export class InputSheetComponent implements OnInit {

  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  public uploader: FileUploader;
  showColumnSelectionForm: boolean = true;

  headers: string[] = [];
  tableContent: any[] = [];

  columnMappings: string[] = [];
  columnRoles: string[] =
    ["E-mail Address (To)",
      "E-mail Address (CC)",
      "Attachment PDF filename"]

  num_mappings_done: number = 0;

  constructor(private log: LoggerService, private wittymail: WittymailService,
    private router: Router) { }

  displayColumnMappingUi() {

    let r: ColumnHeadersWithRowContent = this.wittymail.getColumnHeadersWithSampleRows();
    this.headers = r.headers;
    this.tableContent = r.contents;

    this.log.info("Got %d headers and %d rows", this.headers.length, this.tableContent.length);
    this.showColumnSelectionForm = true;
  }

  sendColumnMapping() {
    this.log.info("Raw column mappings from UI: ", this.columnMappings);
    let m = <ColumnMappings>{};
    this.num_mappings_done = 0;
    for (let i in this.columnMappings) {
      switch (this.columnMappings[i]) {
        case this.columnRoles[0]:
          m.to_column = this.headers[i];
          break;
        case this.columnRoles[1]:
          m.cc_column = this.headers[i];
          break;
        case this.columnRoles[2]:
          m.attachment_column = this.headers[i];
          break;
        default:
          this.log.info("Column %d does not map to anything", i);
          continue;
      }
      this.num_mappings_done++;
    }
    this.log.info("num_mappings_done: ", this.num_mappings_done);
    this.log.info("Processed column mappings: ", m);

    this.validateInputsAndContinue();
  }

  validateInputsAndContinue() {
    let dedupedColumnMappings = this.columnMappings.filter((el, i, a) => i === a.indexOf(el))
    if (dedupedColumnMappings.length != this.columnMappings.length) {
      this.errorDialog.showError("Please select only a single column for each field in the dropdown");
      return;
    }
    if (this.num_mappings_done != this.columnRoles.length) {
      this.errorDialog.showError("Please select a column for each field in the dropdown");
      return;
    }
    
    this.router.navigate(['input-attachment']);
  }

  ngOnInit() {
    this.uploader = new FileUploader({ url: this.wittymail.getFodderUploadUrl(), itemAlias: 'fodder' });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      this.uploader.uploadAll();
    };

    // TODO: Remove this call! Short-circuit to populate table
    this.displayColumnMappingUi();

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.log.info('Fodder uploaded: ', item, status, response);
      if (status === 200) {
        this.displayColumnMappingUi();
      } else {
        this.errorDialog.showError("Failed to upload the sheet to the backend");
      }
    };
  }
}
