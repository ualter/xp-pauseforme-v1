import { Component, OnInit, ViewChild } from '@angular/core';
import { PickerController, Platform } from '@ionic/angular';


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

  labelMinutes: string = "Minutes";
  labelSeconds: string = "Seconds";

  time = "00:02:30";
  minuteValues:string = "0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55";
  units = " minutes";

  constructor(
    private platform: Platform,
    private pickerCtrl: PickerController) { 

      if ( platform.is("iphone") ) {
        this.labelMinutes = "Min";
        this.labelSeconds = "Sec";
      }

      this.platform.ready().then(() => {
      });
  }

  ngOnInit() {
  }

  minuteSecondChanged() {
    let min = this.time.split(":")[1];
    let sec = this.time.split(":")[2];
    if ( parseInt(min) == 0 ) {
      this.units = " seconds";
    } else 
    if ( parseInt(min) == 1 ) {
      this.units = " minute";
    } else {
      this.units = " minutes";
    }
  }
  

}
