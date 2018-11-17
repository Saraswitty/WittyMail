import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileSelectDirective } from 'ng2-file-upload';

import { AboutComponent } from './about/about.component';
import { InputSheetComponent } from './process/input-sheet/input-sheet.component';
import { InputAttachmentComponent } from './process/input-attachment/input-attachment.component';
import { DesignContentsComponent } from './process/design-contents/design-contents.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    FileSelectDirective,
    
    AppComponent,
    AboutComponent,
    InputSheetComponent,
    InputAttachmentComponent,
    DesignContentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
