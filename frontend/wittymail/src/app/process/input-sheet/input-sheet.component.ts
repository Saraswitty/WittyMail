import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService, ColumnHeadersWithRowContent, ColumnMappings } from 'src/app/wittymail.service';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

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

  rawColumnMappings: string[] = [];
  columnRoles: string[] =
    ["E-mail Address (To)",
      "E-mail Address (CC)",
      "Attachment PDF filename"]

  columnMappings: ColumnMappings;
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

  processColumnMapping() {
    this.log.info("Raw column mappings from UI: ", this.rawColumnMappings);
    this.columnMappings = <ColumnMappings>{};
    this.num_mappings_done = 0;
    for (let i in this.rawColumnMappings) {
      switch (this.rawColumnMappings[i]) {
        case this.columnRoles[0]:
          this.columnMappings.to_column = this.headers[i];
          break;
        case this.columnRoles[1]:
          this.columnMappings.cc_column = this.headers[i];
          break;
        case this.columnRoles[2]:
          this.columnMappings.attachment_column = this.headers[i];
          break;
        default:
          this.log.info("Column %d does not map to anything", i);
          continue;
      }
      this.num_mappings_done++;
    }
    this.log.info("num_mappings_done: ", this.num_mappings_done);
    this.log.info("Processed column mappings: ", this.columnMappings);
  }

  saveMappings() {
    this.wittymail.saveEmailToCCColumns(this.columnMappings.to_column, this.columnMappings.cc_column);
    this.wittymail.saveAttachmentMetadata(this.columnMappings.attachment_column);
  }

  validateInputsAndContinue() {
    this.processColumnMapping();
    let dedupedColumnMappings = this.rawColumnMappings.filter((el, i, a) => i === a.indexOf(el))
    // The rawColumnMappings array can have holes for columns with nothing selects, so dump them before comparing
    let noHolesRawColumnMappings = this.rawColumnMappings.filter((el) => el);
    if (dedupedColumnMappings.length != noHolesRawColumnMappings.length) {
      this.errorDialog.showError("Please select only a single column for each field in the dropdown");
      return;
    }
    if (this.num_mappings_done != this.columnRoles.length) {
      this.errorDialog.showError("Please select a column for each field in the dropdown");
      return;
    }
    
    this.saveMappings();
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
      this.log.info('Fodder uploaded: ', item.file.name, status);
      if (status === 200) {
        this.displayColumnMappingUi();
      } else {
        this.errorDialog.showError("Failed to upload the sheet to the backend");
      }
    };
  }
}
