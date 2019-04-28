import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  COLOR_ICONS_SELECTION: string = "warning";

  airportId:string   = "----";
  vorId:string       = "----";
  ndbId:string       = "----";
  fixId:string       = "----";
  dmeId:string       = "----";

  airportSelected: boolean = false;
  vorSelected: boolean = false;
  ndbSelected: boolean = false;
  fixSelected: boolean = false;
  dmeSelected: boolean = false;

  alertAirport: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
