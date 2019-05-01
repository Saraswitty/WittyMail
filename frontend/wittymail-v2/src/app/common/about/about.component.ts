import { Component, OnInit, Inject } from '@angular/core';
import { LoggerService } from 'src/app/util/logger.service';
import { BackendService, VersionInfo } from 'src/app/backend.service';

export interface AboutDialogData {
  version: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  /* Version string displayed on the About dialog, to be fetched from the backend*/
  version: string = "";

  constructor(private log: LoggerService, private backend: BackendService) { }

  ngOnInit() { 
    this.log.info("About dialog created!");
    this.getVersionFromBackend();
  }

  getVersionFromBackend() {
    this.backend.getVersion().subscribe(
      data => {
        let version:VersionInfo = data;
        this.log.info("Version from backend: ", version);
        this.version = version.version;
      }
    );
  }
}
