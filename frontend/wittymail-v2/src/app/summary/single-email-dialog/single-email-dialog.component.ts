import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoggerService } from 'src/app/util/logger.service';
import { BackendService, SendEmailContent } from 'src/app/backend.service';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-single-email-dialog',
  templateUrl: './single-email-dialog.component.html',
  styleUrls: ['./single-email-dialog.component.css']
})
export class SingleEmailDialogComponent implements OnInit {

  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;
  contents: string = "";

  constructor(
    public dialogRef: MatDialogRef<SingleEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendEmailContent,
    private log: LoggerService,
    private backend: BackendService) {}

  ngOnInit() {
    this.contents = JSON.stringify(this.data);
  }

  onSendEmail() {
    this.log.info("Sending Email for: ", this.data);
    this.backend.postSendEmail(this.data).subscribe(
      data => {
        this.log.info("Email sent successfully");
        this.dialogRef.close();
      },
      error => {
        this.errorDialog.showError("Failed to send email: " + error);
      }  
    );
  }

}
