import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AboutComponent } from './common/about/about.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wittymail-v2';

  @ViewChild('about') about: AboutComponent;

  constructor(public dialog: MatDialog) {}

  openAboutDialog() {
    this.dialog.open(AboutComponent, {});
  }
}
