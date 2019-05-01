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

  optionsMinutes: any = [];
  optionsSeconds: any = [];

  labelMinutes: string = "Minutes";
  labelSeconds: string = "Seconds";

  time = "22:15:00";
  minuteValues:string = "0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55";

  @ViewChild('secondPicker') secondPicker;
  open() {
    this.secondPicker.open();
  }

  constructor(
    private platform: Platform,
    private pickerCtrl: PickerController) { 

      for(let i = 1; i < 60; i++) {
        this.optionsMinutes.push({"text":i,"value":i});
      }
      for(let i = 1; i < 59; i++) {
        this.optionsSeconds.push({"text":i,"value":i});
      }

      console.log("Is iPhone: " + platform.is("iphone"));
      if ( platform.is("iphone") ) {
        this.labelMinutes = "Min";
        this.labelSeconds = "Sec";
      }
  }

  op

  async openPickerMinutes() {
      const picker = await this.pickerCtrl.create({
      buttons: [
        {
          text: 'Cancel',
          handler: (d) => {
          }
        },
        {
          text: 'Confirm',
          handler: (d) => {
            console.log(d);
          }
        }
      ],
      columns: [
        {
          name: 'Minutes',
          options: this.optionsMinutes
        },
      ]
    });
    await picker.present();
  }

  async openPickerSeconds() {
    const picker = await this.pickerCtrl.create({
    buttons: [
      {
        text: 'Cancel',
        handler: (d) => {
        }
      },
      {
        text: 'Confirm',
        handler: (d) => {
          console.log(d);
        }
      }
    ],
    columns: [
      {
        name: 'Seconds',
        options: this.optionsSeconds
      },
    ]
  });
  await picker.present();
}

  ngOnInit() {
    
  }

}
