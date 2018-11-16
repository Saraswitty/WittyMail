import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputSheetComponent } from './process/input-sheet/input-sheet.component';
import { InputAttachmentComponent } from './process/input-attachment/input-attachment.component';

const routes: Routes = [
  { path: 'input-sheet', component: InputSheetComponent },
  { path: 'input-attachment', component: InputAttachmentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
