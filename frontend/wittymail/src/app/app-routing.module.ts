import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputSheetComponent } from './process/input-sheet/input-sheet.component';
import { InputAttachmentComponent } from './process/input-attachment/input-attachment.component';
import { DesignContentsComponent } from './process/design-contents/design-contents.component';
import { ReportSummaryComponent } from './process/report-summary/report-summary.component';
import { EmailServerComponent } from './process/email-server/email-server.component';

const routes: Routes = [
  { path: 'input-sheet', component: InputSheetComponent },
  { path: 'input-attachment', component: InputAttachmentComponent },
  { path: 'design-contents', component: DesignContentsComponent },
  { path: 'report-summary', component: ReportSummaryComponent },
  { path: 'email-server', component: EmailServerComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
