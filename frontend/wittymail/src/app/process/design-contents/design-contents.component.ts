import { Component, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService, ColumnHeadersWithRowContent } from 'src/app/wittymail.service';
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
    let r: ColumnHeadersWithRowContent = this.wittymail.getColumnHeadersWithSampleRows();
    this.headers = r.headers;
    this.tableContent = r.contents;

    this.log.info("Got %d headers and %d rows", this.headers.length, this.tableContent.length);
  }

  onSubjectTemplateChanged(value: string) {
    // TODO: Replace #num with sample value from columnHeadersWithSamples
    this.subjectTemplateRealtimeSample = value;
  }

  onBodyTemplateChanged(value: string) {
    value = value.replace(new RegExp('\n', 'g'), "<br />");
    // TODO: Replace #num with sample value from columnHeadersWithSamples
    this.bodyTemplateRealtimeSample = value;
  }

  saveSubjectAndBodyTemplate() {
    this.wittymail.saveEmailSubjectBodyTemplate(this.subjectTemplate, this.bodyTemplate);
  }

  sendEmailMetadata() {
    this.wittymail.postEmailMetadata()
    .subscribe(
      data => {
        this.log.info("POST complete: ", data);
      }
    )
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
    this.sendEmailMetadata();
    this.router.navigate(['report-summary']);
  }

}
