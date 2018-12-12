import { Component, OnInit, Input, Output } from '@angular/core';
import { LoggerService } from '../util/logger.service';
import { WittymailService, VersionInfo } from '../wittymail.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  @Input() showAboutModal: boolean;

  wittyMailVersion: string = "";

  constructor(private log: LoggerService, private wittymail: WittymailService) { 

  }

  ngOnInit() {
    this.wittyMailVersion = "";

    this.wittymail.getVersion()
    .subscribe(
      data => {
        let version: VersionInfo = data;
        this.log.info("Version from backend: ", version);
        this.wittyMailVersion = version.version;
      }
    )
  }
}
