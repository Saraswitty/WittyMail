import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoggerService } from 'src/app/util/logger.service';

@Component({
  selector: 'app-single-email-dialog',
  templateUrl: './single-email-dialog.component.html',
  styleUrls: ['./single-email-dialog.component.css']
})
export class SingleEmailDialogComponent implements OnInit {

  contents: string = "";

  constructor(
    public dialogRef: MatDialogRef<SingleEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private log: LoggerService) {}

  ngOnInit() {
    this.contents = JSON.stringify(this.data);
  }

  onSendEmail() {
    this.log.info("Sending Email for: ", this.data);
    this.dialogRef.close();
  }

}
