import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailDesignComponent } from '../email-design/email-design.component';
import { MatStepper } from '@angular/material';
import { LoggerService } from '../util/logger.service';

@Component({
  selector: 'app-steps-slider',
  templateUrl: './steps-slider.component.html',
  styleUrls: ['./steps-slider.component.css']
})
export class StepsSliderComponent implements OnInit {

  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild("stepEmailDesign") stepEmailDesign: EmailDesignComponent;

  constructor(private log: LoggerService) { }

  ngOnInit() {
  }

  /**
   * Watch the main stepper for step changes and call the populate() API on the 
   * component for the page which is about to be shown next
   */
  populateNextStepPage() {
    this.log.info("Main stepper changed: ", this.stepper.selectedIndex);

    if (this.stepper.selectedIndex + 1 == 2) {
      this.stepEmailDesign.populateTable();
    }
  }

}
