import { Component, OnInit, Input } from '@angular/core';
import { LoggerService } from 'src/app/util/logger.service';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  @Input() showErrorModal: boolean;
  @Input() errorMessage: string;

  constructor(private log: LoggerService) { 

  }

  ngOnInit() {
  }

}
