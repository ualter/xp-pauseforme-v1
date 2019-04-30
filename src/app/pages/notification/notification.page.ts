import { Component, OnInit } from '@angular/core';
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

  

  optionsMinutes: any = [
    {text: '1992',value: 1992},
    {text: '1993',value: 1992},
    {text: '2010',value: 2010},
  ];

  optionsSeconds: any = [
    {text: '1',value: 1},
    {text: '2',value: 1},
    {text: '3',value: 3},
    {text: '4',value: 4},
    {text: '5',value: 5},
    {text: '6',value: 6},
  ];

  options = this.optionsSeconds;
  
  constructor(
    private platform: Platform,
    private pickerCtrl: PickerController) { 

      this.platform.ready().then(() => {
      });
  }

  async openPicker() {
      const picker = await this.pickerCtrl.create({
      buttons: [{
        text: 'Done',
        handler: (d) => {
          console.log(d);
        }
      }],
      columns: [
        {
          name: 'unit',
          options: [
            {text: 'Seconds',value: 1},
            {text: 'Minutes',value: 2},
          ]
        },
        {
          name: 'qtde',
          options: this.options
        },
      ]
    });
    await picker.present();

    let ele = document.getElementsByTagName("ion-picker-column")[0];
    console.log(ele.querySelector(".picker-opt-selected").firstChild);

    this.options = this.optionsMinutes;

    //console.log((el<HTMLElement>).shadowRoot.querySelector(".picker-opt-selected"));
  }

  ngOnInit() {
    
  }

}
