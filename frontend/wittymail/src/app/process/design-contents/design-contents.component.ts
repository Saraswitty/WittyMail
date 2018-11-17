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
      sampleValue: 'Peter Nelson'
    },
    {
      columnName: 'Class',
      sampleValue: 'Nur'
    },
    {
      columnName: 'Sponsor',
      sampleValue: 'John Doe'
    },
    {
      columnName: 'Reference',
      sampleValue: 'Bob Jones'
    },
    {
      columnName: 'Mail ID',
      sampleValue: 'john.doe@acme.com'
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
