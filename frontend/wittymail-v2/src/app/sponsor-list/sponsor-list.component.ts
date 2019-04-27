import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.css']
})
export class SponsorListComponent implements OnInit {

  headers = ['Sr No.', 'Name of Child', 'Class', 'Sponsor', 'Mail ID', 'Reference', 'Reference Mail ID']
  sheetContents = [
    {
      'Sr No.': "1",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi",
      'Sponsor': "Kalubai pratishthan",
      'Mail ID': "Sanjaysandhu8090@gmail.com",
      'Reference': "Ravi",
      'Reference Mail ID': "amboreravi@gmail.com"
    },
    {
      'Sr No.': "2",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi",
      'Sponsor': "Kalubai pratishthan",
      'Mail ID': "Sanjaysandhu8090@gmail.com",
      'Reference': "Ravi",
      'Reference Mail ID': "amboreravi@gmail.com"
    },
    {
      'Sr No.': "3",
      'Name of Child': "Aradhya Karche",
      'Class': "Nursery-kalewadi",
      'Sponsor': "Kalubai pratishthan",
      'Mail ID': "Sanjaysandhu8090@gmail.com",
      'Reference': "Ravi",
      'Reference Mail ID': "amboreravi@gmail.com"
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
