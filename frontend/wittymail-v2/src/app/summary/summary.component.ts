import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LoggerService } from '../util/logger.service';
import { BackendService, ColumnHeadersWithRowContent } from '../backend.service';
import { MatStepper } from '@angular/material';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  @Input('mainStepper') mainStepper: MatStepper;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  /** List of strings, each being the heading text for a column */
  headers = [];
  displayedHeaders = ['select'];

  /** Data displayed in the table */
  sheetContents = [];

  selection = new SelectionModel<any>(true, []);

  constructor(private log: LoggerService, private backend: BackendService) { }

  ngOnInit() {
  }

  /**
   * Populate the table that displays the contents of the sheet
   * 
   * This is called by the main stepper when this step becomes visible, because
   * the data fetching depends on previous steps.
   */
  populateTable() {    
    this.backend.getSheetContents().subscribe(
      data => {
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent> data;

        this.headers = this.headers.concat(r.headers);
        this.headers = this.headers.concat(r.extended_headers);
        this.displayedHeaders = this.displayedHeaders.concat(this.headers);
        this.sheetContents = r.contents;
    
        this.log.info("Using %s headers and %d rows", this.headers, this.sheetContents.length);
      },
      error => {
        this.errorDialog.showError("Failed to get contents of the Excel sheet: " + error);
      }
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.sheetContents.length;
    return numSelected == numRows;
  }
  
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.sheetContents.forEach(row => this.selection.select(row));
  }

  onSendSelectedEmails() {
    this.log.info("Selected rows: ", this.selection.selected);
  }
}
