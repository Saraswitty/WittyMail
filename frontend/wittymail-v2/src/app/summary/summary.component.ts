import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LoggerService } from '../util/logger.service';
import { BackendService, ColumnHeadersWithRowContent } from '../backend.service';
import { MatStepper, MatDialog, MatTableDataSource, MatSort } from '@angular/material';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { SingleEmailDialogComponent } from './single-email-dialog/single-email-dialog.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  @Input('mainStepper') mainStepper: MatStepper;
  @ViewChild(MatSort) sortedTable: MatSort;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  /** List of strings, each being the heading text for a column */
  headers = [];
  defaultDisplayedHeaders = ['select', 'view-email']
  displayedHeaders = [];

  /** Data displayed in the table */
  sheetContents = null;

  selection = new SelectionModel<any>(true, []);

  downloadSheetUrl: string = '';

  constructor(private log: LoggerService, private backend: BackendService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.downloadSheetUrl = this.backend.getSheetDownloadUrl();
    /* Cache buster, because the sheet will have the same name */
    this.downloadSheetUrl += "?" + Math.random();
  }

  onClickDownloadSheet() {
    this.downloadSheetUrl = this.backend.getSheetDownloadUrl();
    /* Cache buster, because the sheet will have the same name */
    this.downloadSheetUrl += "?" + Math.random();
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

        if (r.extended_headers && r.extended_headers.length) {
          this.headers = r.extended_headers.concat(r.headers);
        } else {
          this.headers = r.headers;
        }
        this.displayedHeaders = this.defaultDisplayedHeaders;
        this.displayedHeaders = this.displayedHeaders.concat(this.headers);
        this.sheetContents = new MatTableDataSource(r.contents);
        this.sheetContents.sort = this.sortedTable;
    
        this.log.info("Using %d headers and %d rows", this.headers.length, this.sheetContents.length);
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

    this.selection.selected.forEach(row => {
      this.log.info("Sending Email for: ", row);
      this.backend.postSendEmail(row.email).subscribe(
      data => {
        this.log.info("Email sent successfully");
      },
      error => {
        this.errorDialog.showError("Failed to send email: " + error);
      }  
    );
    });
  }

  onViewSingleEmail(row: any) {
    this.log.info("View single e-mail for: ", row);

    const dialogRef = this.dialog.open(SingleEmailDialogComponent, {
      data: row.email
    });

    dialogRef.afterClosed().subscribe(result => {
      this.log.info('The dialog was closed');
    });
  }
}
