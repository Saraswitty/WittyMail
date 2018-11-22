import { Component } from '@angular/core';
import { LoggerService } from './util/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wittymail';

  showAboutModal: boolean = false;

  constructor(private log: LoggerService) {
    this.log.info("Created: ", this);
  }
}
