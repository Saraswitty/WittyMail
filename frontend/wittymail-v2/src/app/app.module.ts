import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';

import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatStepperModule} from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatTableModule} from '@angular/material/table';
import {MatRadioModule} from '@angular/material/radio';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StepsSliderComponent } from './steps-slider/steps-slider.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material';
import { SponsorListComponent } from './sponsor-list/sponsor-list.component';
import { EmailDesignComponent } from './email-design/email-design.component';
import { SummaryComponent } from './summary/summary.component';
import { AboutComponent } from './common/about/about.component';
import { ErrorDialogComponent } from './common/error-dialog/error-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    StepsSliderComponent,
    AttachmentsComponent,
    SponsorListComponent,
    EmailDesignComponent,
    SummaryComponent,
    AboutComponent,
    ErrorDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule, 

    FileUploadModule,
    FormsModule,
    MatToolbarModule,
    MatStepperModule,
    MatTableModule,
    MatRadioModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
