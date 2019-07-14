import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { LoggerService } from 'src/app/util/logger.service';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  constructor(private snackBar: MatSnackBar, private log: LoggerService) { }

  ngOnInit() {
  }

  showError(message: string) {
    this.log.error(message);
    this.snackBar.open(message, 'OK', {});
  }

}
