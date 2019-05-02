import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { LoggerService } from '../util/logger.service';
import { MatInput, MatStepper } from '@angular/material';
import { BackendService, ColumnHeadersWithRowContent } from '../backend.service';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-email-design',
  templateUrl: './email-design.component.html',
  styleUrls: ['./email-design.component.css']
})
export class EmailDesignComponent implements OnInit {

  @Input('mainStepper') mainStepper: MatStepper;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;
  @ViewChild("subjectInput") subjectInput: MatInput;

  /** List of strings, each being the heading text for a column */
  headers = [];

  /** Data displayed in the table */
  sheetContents = [];

  subjectTemplate: string = "";
  subjectSample: string = "This is the actual subject";

  bodyTemplate: string = ""
  bodySample: string = "";

  constructor(private log: LoggerService, private backend: BackendService) { }

  ngOnInit() {
  }

  /**
   * Populate the table that displays the column headers and a few sample rows
   * 
   * This is called by the main stepper when this step becomes visible, because
   * the data fetching depends on previous steps.
   */
  populateTable() {
    this.backend.getColumnHeadersWithSampleRows().subscribe(
      data => {
        this.log.info("Received column headers with samples: ", data);
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent> data;
        this.headers = r.headers;
        this.sheetContents = r.contents;
    
        this.log.info("Got %d headers and %d rows", this.headers.length, this.sheetContents.length);
      },
      error => {
        this.errorDialog.showError("Failed to get sample rows from the Excel sheet: " + error);
      }
    );
  }

  onClickColumn(columnName) {
    this.log.info("Selected column: %s", columnName);
    this.subjectTemplate += " {" + columnName + "} ";
  }

}
