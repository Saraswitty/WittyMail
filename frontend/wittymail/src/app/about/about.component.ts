import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  @Input() showAboutModal: boolean;

  wittyMailVersion: string = "";

  constructor() { }

  ngOnInit() {
    // TODO: Call REST API to get version
    this.wittyMailVersion = "v0.1.0 beta released on 11/Nov/2018";
  }
}
