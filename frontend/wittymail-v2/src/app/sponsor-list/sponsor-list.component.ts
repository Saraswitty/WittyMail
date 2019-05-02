import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { BackendService, ColumnHeadersWithRowContent, ColumnMappings } from '../backend.service';
import { LoggerService } from '../util/logger.service';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.css']
})
export class SponsorListComponent implements OnInit {

  @Input('mainStepper') mainStepper: MatStepper;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('columnMappingStepper') columnMappingStepper: MatStepper;
  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;
  public uploader: FileUploader;

  /** List of strings, each being the heading text for a column */
  headers = [];

  /** Dict of columnHeaderName -> selectedMapping */
  columnSelectedAs = {};

  /** Data displayed in the table */
  sheetContents = [];

  constructor(private backend: BackendService, private log: LoggerService) { }

  /**
   * Setup the file uploader component's event handlers
   */
  ngOnInit() {
    this.uploader = new FileUploader({ url: this.backend.getFodderUploadUrl(), itemAlias: 'sponsor-sheet' });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      this.uploader.uploadAll();
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status === 200) {
        this.log.info('Sponsor sheet uploaded: ', item.file.name, status);
        this.stepper.next();
        this.displayColumnMappingUi();
      } else {
        this.errorDialog.showError("Failed to upload sponsor list '" + item.file.name + "': " + status + " " + response);
      }
    };
  }

  /**
   * Populate the table that displays the column headers and a few sample rows
   */
  displayColumnMappingUi() {
    this.backend.getColumnHeadersWithSampleRows().subscribe(
      data => {
        this.log.info("Received column headers with samples: ", data);
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent> data;
        this.headers = r.headers;
        this.sheetContents = r.contents;
    
        this.log.info("Got %d headers and %d rows", this.headers.length, this.sheetContents.length);
      },
      error => {
        this.errorDialog.showError("Failed to analyze the Excel sheet");
      }
    );
  }

  /**
   * Handle the button click event on a column header by noting it as the
   * selected mapping for the currently active mapping step
   * 
   * @param selectedColumnHeader Name of the column being clicked
   */
  onSelectColumn(selectedColumnHeader: string) {
    let currentColumnMapping = this.columnMappingStepper.selected.label;
    this.log.info("Selected column %s for %s", selectedColumnHeader, currentColumnMapping)

    this.columnSelectedAs[selectedColumnHeader] = currentColumnMapping;
    
    
    if (this.columnMappingStepper.selectedIndex == this.columnMappingStepper.steps.length - 1) {
      this.log.info("Done selecting columns, moving on...");
      this.saveColumnMappingAndContinue();
    } else {
      this.columnMappingStepper.next();
    }
  }

  /**
   * Save the selected column mapping to the backend and move to the next page
   */
  saveColumnMappingAndContinue() {
    let mapping: ColumnMappings = {
      to_column: "",
      cc_column: "",
      attachment_column: ""
    }

    /* The map-stepper API returns a QueryList which, unlike an array, is not
     * directly accesible by index, so convert it to a normal array first
     */
    let mappingSteps = [];
    this.columnMappingStepper.steps.forEach(step => {mappingSteps.push(step)});

    /* The dict is the other way round (columnHeader -> selectedMapping),
     * so we have to loop through it
     */
    for (let key in this.columnSelectedAs) {
      if (this.columnSelectedAs[key] == mappingSteps[0].label) {
        mapping.to_column = key;
      }
      if (this.columnSelectedAs[key] == mappingSteps[1].label) {
        mapping.cc_column = key;
      }
      if (this.columnSelectedAs[key] == mappingSteps[2].label) {
        mapping.attachment_column = key;
      }
    }
    this.log.info("Selected columns: ", mapping);

    // TODO: Do we need this after refactoring?
    this.backend.saveEmailToCCColumns(mapping.to_column, mapping.cc_column);
    this.backend.saveAttachmentMetadata(mapping.attachment_column);

    this.backend.postColumnMapping(mapping).subscribe(
      data => {
        this.log.info("Column mapping posted, moving on...")
        this.mainStepper.next();
      },
      error => {
        this.errorDialog.showError("Failed to select columns: " + error);
      }
    );
  }
}
