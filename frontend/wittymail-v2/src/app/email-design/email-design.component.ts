import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { LoggerService } from '../util/logger.service';
import { MatInput, MatStepper } from '@angular/material';
import { BackendService, ColumnHeadersWithRowContent, TemplateInput, TemplateOutput, EmailServerDetails, EmailMetadata } from '../backend.service';
import { ErrorDialogComponent } from '../common/error-dialog/error-dialog.component';

enum LastFocusedInput {
  SUBJECT,
  BODY
}

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

  /* Which element was last focussed? */
  lastFocused: LastFocusedInput = LastFocusedInput.SUBJECT;

  emailSettings: EmailServerDetails = {
    service: 'Gmail',
    username: '',
    password: ''
  };

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
    
    /* Trigger template-to-reality conversion for the last focused field */
    if (this.lastFocused == LastFocusedInput.SUBJECT) {
      this.subjectTemplate += " {" + columnName + "} ";
      this.onSubjectTemplateChanged(this.subjectTemplate);
    } else if (this.lastFocused == LastFocusedInput.BODY) {
      this.bodyTemplate += " {" + columnName + "} ";
      this.onBodyTemplateChanged(this.subjectTemplate);
    }
  }

  onSubjectTemplateChanged(value: string) {
    this.lastFocused = LastFocusedInput.SUBJECT;

    // Optimization: Don't bother the backend if there is no template to be substituted yet
    if (value.indexOf("{") == -1) {
      this.subjectSample = value;
      return;
    }

    let v: TemplateInput = {
      template: value
    }
    this.backend.resolveTemplate(v).subscribe(
      data => {
        this.log.info("Template resolved to: ", data);
        let r: TemplateOutput = <TemplateOutput>data;
        this.subjectSample = r.reality;
      },
      error => {
        this.errorDialog.showError("Your subject template is weird, try making it more realistic");
      }
    );
  }

  onBodyTemplateChanged(event: any) {
    this.lastFocused = LastFocusedInput.BODY;

    // Optimization: Don't bother the backend if there is no template to be substituted yet
    if (this.bodyTemplate.indexOf("{") == -1) {
      this.bodySample = this.bodyTemplate;
      return;
    }

    let v: TemplateInput = {
      template: this.bodyTemplate
    }
    this.backend.resolveTemplate(v).subscribe(
      data => {
        this.log.info("Template resolved to: ", data);
        let r: TemplateOutput = <TemplateOutput>data;
        this.bodySample = r.reality;
      },
      error => {
        this.errorDialog.showError("Your body template is weird, try making it more realistic");
      }
    );
  }

  onSubmitEmailTemplates() {
    let payload: EmailMetadata = {
      body_template: this.bodyTemplate,
      subject_template: this.subjectTemplate
    }
    this.log.info("Posting email templates: ", payload);
    this.backend.postEmailMetadata(payload).subscribe(
      data => {
        this.log.info("Email metadata posted, moving on...");
        this.stepper.next();
      },
      error => {
        this.errorDialog.showError(error.error_message);
      }
    );
  }

  onSubmitEmailServer() {
    this.backend.postEmailServerDetails(this.emailSettings).subscribe(
      data => {
        this.log.info("Email server details posted, moving on...");
        this.mainStepper.next();
      },
      error => {
        this.errorDialog.showError(error.error_message);
      }
    );
  }

}
