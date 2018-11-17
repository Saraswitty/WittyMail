import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-design-contents',
  templateUrl: './design-contents.component.html',
  styleUrls: ['./design-contents.component.css']
})
export class DesignContentsComponent implements OnInit {

  columnHeadersWithSamples = [
    {
      columnName: 'Name of Child',
      sampleValue: 'Peter Nelson',
      sampleValue2: 'Jenna Paulson'
    },
    {
      columnName: 'Class',
      sampleValue: 'Nur',
      sampleValue2: 'LKG'
    },
    {
      columnName: 'Sponsor',
      sampleValue: 'John Doe',
      sampleValue2: 'James May'
    },
    {
      columnName: 'Reference',
      sampleValue: 'Bob Jones',
      sampleValue2: 'Anna Peterson'
    },
    {
      columnName: 'Mail ID',
      sampleValue: 'john.doe@acme.com',
      sampleValue2: 'james.may@acme.com'
    }
  ];

  subjectTemplate: string = "";
  subjectTemplateRealtimeSample: string = "";

  bodyTemplate: string = "";
  bodyTemplateRealtimeSample: string = "";

  constructor() { }

  ngOnInit() {
  }

  onSubjectTemplateChanged(value: string) {
    // TODO: Replace #num with sample value from columnHeadersWithSamples
    this.subjectTemplateRealtimeSample = value;
  }

  onBodyTemplateChanged(value: string) {
    value = value.replace(new RegExp('\n', 'g'), "<br />");
    // TODO: Replace #num with sample value from columnHeadersWithSamples
    this.bodyTemplateRealtimeSample = value;
  }

}
