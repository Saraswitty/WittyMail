import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoggerService } from 'src/app/util/logger.service';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  private showErrorModal: boolean = false;
  errorMessage: string = "";

  constructor(private log: LoggerService) { 
    log.info("Error dialog: ", this);
  }

  updateVisibilityState(newState: boolean) {
    this.showErrorModal = newState;
  }

  showError(message: string) {
    this.log.error(message);
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  ngOnInit() {
  }

}
