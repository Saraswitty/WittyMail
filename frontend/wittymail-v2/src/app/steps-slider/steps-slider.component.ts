import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailDesignComponent } from '../email-design/email-design.component';
import { MatStepper } from '@angular/material';
import { LoggerService } from '../util/logger.service';
import { SummaryComponent } from '../summary/summary.component';

@Component({
  selector: 'app-steps-slider',
  templateUrl: './steps-slider.component.html',
  styleUrls: ['./steps-slider.component.css']
})
export class StepsSliderComponent implements OnInit {

  @ViewChild("stepEmailDesign") stepEmailDesign: EmailDesignComponent;
  @ViewChild("stepSummary") stepSummary: SummaryComponent;

  constructor(private log: LoggerService) { }

  ngOnInit() {
  }

  /**
   * Watch the main stepper for step changes and call the populate() API on the 
   * component for the page which is about to be shown next
   */
  populateNextStepPage(stepper: MatStepper) {
    this.log.info("Main stepper changed: ", stepper.selectedIndex);

    if (stepper.selectedIndex == 2) {
      this.stepEmailDesign.populateTable();
    } else if (stepper.selectedIndex == 3) {
      this.stepSummary.populateTable();
    }
  }

}
