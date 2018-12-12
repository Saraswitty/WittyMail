import { Component, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService, ColumnHeadersWithRowContent, TemplateInput, TemplateOutput } from 'src/app/wittymail.service';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-design-contents',
  templateUrl: './design-contents.component.html',
  styleUrls: ['./design-contents.component.css']
})
export class DesignContentsComponent implements OnInit {

  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  headers: string[] = [];
  tableContent: any[] = [];

  subjectTemplate: string = "";
  subjectTemplateRealtimeSample: string = "";

  bodyTemplate: string = "";
  bodyTemplateRealtimeSample: string = "";

  constructor(private log: LoggerService, private wittymail: WittymailService,
    private router: Router) { }

  ngOnInit() {
    this.displayColumnMappingUi();
  }

  displayColumnMappingUi() {
    this.wittymail.getColumnHeadersWithSampleRows().subscribe(
      data => {
        this.log.info("Regurgitate complete: ", data);
        let r: ColumnHeadersWithRowContent = <ColumnHeadersWithRowContent>data;
        this.headers = r.headers;
        this.tableContent = r.contents;

        this.log.info("Got %d headers and %d rows", this.headers.length, this.tableContent.length);
      },
      error => {
        this.errorDialog.showError("Failed to analyze the Excel sheet");
      }
    );

  }

  onSubjectTemplateChanged(value: string) {
    // Optimization: Don't bother the backend if there is no template to be substituted yet
    if (value.indexOf("#") == -1) {
      this.subjectTemplateRealtimeSample = value;
      return;
    }

    let v: TemplateInput = {
      template: value
    }
    this.wittymail.resolveTemplate(v).subscribe(
      data => {
        this.log.info("Template resolved to: ", data);
        let r: TemplateOutput = <TemplateOutput>data;
        this.subjectTemplateRealtimeSample = r.reality;
      },
      error => {
        this.errorDialog.showError("Your subject template is weird, try making it more realistic");
      }
    );
  }

  onBodyTemplateChanged(event: any) {
    // Optimization: Don't bother the backend if there is no template to be substituted yet
    if (this.bodyTemplate.indexOf("#") == -1) {
      this.bodyTemplateRealtimeSample = this.bodyTemplate;
      return;
    }

    let v: TemplateInput = {
      template: this.bodyTemplate
    }
    this.wittymail.resolveTemplate(v).subscribe(
      data => {
        this.log.info("Template resolved to: ", data);
        let r: TemplateOutput = <TemplateOutput>data;
        this.bodyTemplateRealtimeSample = r.reality;
      },
      error => {
        this.errorDialog.showError("Your body template is weird, try making it more realistic");
      }
    );
  }

  saveSubjectAndBodyTemplate() {
    this.wittymail.saveEmailSubjectBodyTemplate(this.subjectTemplate, this.bodyTemplate);
  }

  sendEmailMetadata() {
    this.wittymail.postEmailMetadata()
      .subscribe(
        data => {
          this.log.info("POST complete: ", data);
          this.router.navigate(['report-summary']);
        },
        error => {
          this.errorDialog.showError("Something really bad happened. Let's blame it on Ajay.");
        }
      );
  }

  sendAttachmentMetadata() {
    this.wittymail.postAttachmentMetadata()
      .subscribe(
        data => {
          this.log.info("POST complete: ", data);
          this.sendEmailMetadata();
        },
        error => {
          this.errorDialog.showError("Something really bad happened. Let's blame it on Ajay.");
        }
      );
  }

  validateInputsAndContinue() {
    if (this.subjectTemplate.length == 0) {
      this.errorDialog.showError("Please type a subject for the e-mails");
      return;
    }
    if (this.bodyTemplate.length == 0) {
      this.errorDialog.showError("Please type some content for the e-mails");
      return;
    }

    this.saveSubjectAndBodyTemplate();
    this.sendAttachmentMetadata();
  }

}
