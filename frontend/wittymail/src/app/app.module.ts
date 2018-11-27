import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileSelectDirective } from 'ng2-file-upload';
import { HttpClientModule } from '@angular/common/http';

import { AboutComponent } from './about/about.component';
import { InputSheetComponent } from './process/input-sheet/input-sheet.component';
import { InputAttachmentComponent } from './process/input-attachment/input-attachment.component';
import { DesignContentsComponent } from './process/design-contents/design-contents.component';
import { FormsModule } from '@angular/forms';
import { ReportSummaryComponent } from './process/report-summary/report-summary.component';
import { ConsoleLoggerService } from './util/console-logger.service';
import { LoggerService } from './util/logger.service';
import { ErrorDialogComponent } from './common/error-dialog/error-dialog.component';
import { EmailServerComponent } from './process/email-server/email-server.component';
import { QuillModule } from 'ngx-quill'

@NgModule({
  declarations: [
    FileSelectDirective,
    
    AppComponent,
    AboutComponent,
    InputSheetComponent,
    InputAttachmentComponent,
    DesignContentsComponent,
    ReportSummaryComponent,
    ErrorDialogComponent,
    EmailServerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    QuillModule
  ],
  providers: [
    { provide: LoggerService, useClass: ConsoleLoggerService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
