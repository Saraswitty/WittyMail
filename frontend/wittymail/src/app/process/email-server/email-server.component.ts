import { Component, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from 'src/app/util/logger.service';
import { WittymailService, EmailServerDetails } from 'src/app/wittymail.service';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-email-server',
  templateUrl: './email-server.component.html',
  styleUrls: ['./email-server.component.css']
})
export class EmailServerComponent implements OnInit {

  @ViewChild('errorDialog') errorDialog: ErrorDialogComponent;

  emailSettings = {
    service: 'GMail',
    username: '',
    password : ''
  };

  constructor(private log: LoggerService, private wittymail: WittymailService,
    private router: Router) { }

  ngOnInit() {
  }

  sendEmailServerDetails() {
    let d: EmailServerDetails = {
      service: this.emailSettings.service,
      username: this.emailSettings.username,
      password: this.emailSettings.password
    };

    this.wittymail.postEmailServerDetails(d).subscribe(
      data => {
        this.log.info("POST complete: ", data);
        this.router.navigate(['design-contents']);
      },
      error => {
        this.errorDialog.showError(error.error_message);
      }
    );
  }

  validateInputsAndContinue() {
    this.log.info("emailSettings: ", this.emailSettings);
    
    this.sendEmailServerDetails();
  }

}
