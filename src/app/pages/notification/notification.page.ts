import { Component, OnInit, ViewChild } from '@angular/core';
import { PickerController, Platform } from '@ionic/angular';
import { LocalNotifications, ELocalNotificationTriggerUnit, ILocalNotification } from '@ionic-native/local-notifications/ngx';
import { XpWebSocketService } from 'src/app/services/xp-websocket.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MapService } from 'src/app/services/map.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  COLOR_ICONS_SELECTION: string = "warning";

  optionsNm: any = [];
  minuteValues:string = "0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55";
  alertLines: any = [];
  initialStateAlert: any = [false,false,false,false,false]; 
  scheduled:any = [];
  
  private subscription: Subscription;

  constructor(
    private platform: Platform,
    private pickerCtrl: PickerController,
    private localNotifications: LocalNotifications,
    private utils: UtilsService,
    private xpWsSocket: XpWebSocketService,
    private mapService: MapService) { 

      for(let i = 0; i <= 100; i++) {
        this.optionsNm.push({text: '' + i,value: i});
      }
      if ( platform.is("iphone") ) {
      }

      let unitsSymbol = "min";
      this.alertLines = [
        {
          "alertId":1,
          "id": "Airport",
          "alert":false,
          "userSelected":true,
          "navaId":"LEBL",
          "distance": 266,
          "userDistance": 50,
          "estimatedPause":"01:43:32", 
          "timeToPause": "00:00:00",
          "units":unitsSymbol,
          "nmToPause":0
        },
        {
          "alertId":2,
          "id": "VOR",
          "alert":false,
          "userSelected":false,
          "navaId":"SLL",
          "distance": 320,
          "userDistance": 53,
          "estimatedPause":"01:33:12", 
          "timeToPause": "00:00:00",
          "units":unitsSymbol,
          "nmToPause":0
        },
        {
          "alertId":3,
          "id": "NDB",
          "alert":false,
          "userSelected":true,
          "navaId":"TOLUS",
          "distance": 123,
          "userDistance": 23,
          "estimatedPause":"00:23:02", 
          "timeToPause": "00:00:00",
          "units":unitsSymbol,
          "nmToPause":0
        },
        {
          "alertId":4,
          "id": "Fix",
          "alert":false,
          "userSelected":false,
          "navaId":"VEKKO",
          "distance": 54,
          "userDistance": 50,
          "estimatedPause":"02:30:02", 
          "timeToPause": "00:00:00",
          "units":unitsSymbol,
          "nmToPause":0
        },
        {
          "alertId":5,
          "id": "DME",
          "alert":false,
          "userSelected":false,
          "navaId":"SLE",
          "distance": 77,
          "userDistance": 20,
          "estimatedPause":"01:10:58", 
          "timeToPause": "00:00:00",
          "units":unitsSymbol,
          "nmToPause":0
        }
      ];

      this.getAll();
      // Here should recreate all the alerts based on those that exists...  
      console.log(this.scheduled);

      this.platform.ready().then(() => {
        // Local Notifications Events
        // Events Supported: add, trigger, click, clear, cancel, update, clearall and cancelall
        this.localNotifications.on('click').subscribe(res => {
          let msg = res.data ? 'CLICK -> ' + res.data.mydata : 'CLICK -> Not Found mydata object';
        });
        this.localNotifications.on('trigger').subscribe(res => {
          let msg = res.data ? 'TRIGGER -> ' + res.data.mydata : 'TRIGGER -> Not Found mydata object';
        });
      });

      this.subscription = this.xpWsSocket.messageStream().subscribe (
          json => {
            var json = JSON.parse(json);
            if ( json.airplane ) {
              this.alertLines[0].alert          = json.airplane.pauseforme.navaid.config.selected.airport;
              this.alertLines[0].userSelected   = json.airplane.pauseforme.navaid.config.selected.airport;
              this.alertLines[0].navaId         = json.airplane.pauseforme.navaid.config.id.airport;
              this.alertLines[0].distance       = json.airplane.pauseforme.navaid.config.distance.airport;
              this.alertLines[0].userDistance   = json.airplane.pauseforme.navaid.userAirportDistance;
              this.alertLines[0].estimatedPause = this.mapService.etaPauseByNavaIdAirport;
              this.checkTriggerDistanceAlertNotification(0);

              this.alertLines[1].alert          = json.airplane.pauseforme.navaid.config.selected.vor;
              this.alertLines[1].userSelected   = json.airplane.pauseforme.navaid.config.selected.vor;
              this.alertLines[1].navaId         = json.airplane.pauseforme.navaid.config.id.vor;
              this.alertLines[1].distance       = json.airplane.pauseforme.navaid.config.distance.vor;
              this.alertLines[1].userDistance   = json.airplane.pauseforme.navaid.userVORDistance;
              this.alertLines[1].estimatedPause = this.mapService.etaPauseByNavaIdVor;
              this.checkTriggerDistanceAlertNotification(1);

              this.alertLines[2].alert          = json.airplane.pauseforme.navaid.config.selected.ndb;
              this.alertLines[2].userSelected   = json.airplane.pauseforme.navaid.config.selected.ndb;
              this.alertLines[2].navaId         = json.airplane.pauseforme.navaid.config.id.ndb;
              this.alertLines[2].distance       = json.airplane.pauseforme.navaid.config.distance.ndb;
              this.alertLines[2].userDistance   = json.airplane.pauseforme.navaid.userNDBDistance;
              this.alertLines[2].estimatedPause = this.mapService.etaPauseByNavaIdNdb;
              this.checkTriggerDistanceAlertNotification(2);

              this.alertLines[3].alert          = json.airplane.pauseforme.navaid.config.selected.fix;
              this.alertLines[3].userSelected   = json.airplane.pauseforme.navaid.config.selected.fix;
              this.alertLines[3].navaId         = json.airplane.pauseforme.navaid.config.id.fix;
              this.alertLines[3].distance       = json.airplane.pauseforme.navaid.config.distance.fix;
              this.alertLines[3].userDistance   = json.airplane.pauseforme.navaid.userFixDistance;
              this.alertLines[3].estimatedPause = this.mapService.etaPauseByNavaIdFix;
              this.checkTriggerDistanceAlertNotification(3);

              this.alertLines[4].alert          = json.airplane.pauseforme.navaid.config.selected.dme;
              this.alertLines[4].userSelected   = json.airplane.pauseforme.navaid.config.selected.dme;
              this.alertLines[4].navaId         = json.airplane.pauseforme.navaid.config.id.dme;
              this.alertLines[4].distance       = json.airplane.pauseforme.navaid.config.distance.dme;
              this.alertLines[4].userDistance   = json.airplane.pauseforme.navaid.userDMEDistance;
              this.alertLines[4].estimatedPause = this.mapService.etaPauseByNavaIdDme;
              this.checkTriggerDistanceAlertNotification(4);
            }
          },
          error => {
            this.utils.error('Oops', error)
          }
      );

  }

  private checkTriggerDistanceAlertNotification(index) {
    if (this.alertLines[index].nmToPause > 0) {
      let currentDistance = this.alertLines[index].distance;
      let notificDistance = this.alertLines[index].nmToPause;
      if (currentDistance <= notificDistance) {
        this.createDistanceAlert(index, this.alertLines[index]);
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  minuteSecondChanged(index) {
    let line = this.alertLines[index];
    let min  = parseInt(line.timeToPause.split(":")[1]);
    let sec  = parseInt(line.timeToPause.split(":")[2]);
    if ( min == 0 ) {
      line.units = "sec";
    } else 
    if ( min == 1 ) {
      line.units = "min";
    } else {
      line.units = "min";
    }
    
    // Remove the previous and create the new with the new values
    this.cancelTimeAlert(index,line);

    if ( min > 0 || sec > 0 ) {
      // Recreate the Alert (update)
      this.createTimeAlert(index,line);
    }
  }

  createTimeMessageAlert(line) {
    return 'We are close to the estimated time of ' 
              + line.timeToPause.substr(3) + ' ' + line.units + ' to pause X-Plane (' 
              + line.navaId + " " 
              + line.distance + "nm <= " 
              + line.userDistance + "nm)";
  }

  createTimeAlert(index,line) {
    let msg      = this.createTimeMessageAlert(line);
    let totalSec = this.calculateTimeScheduleInSeconds(line);
    console.log("Create Time Alert for " + line.alertId + " -> " + msg);

    this.localNotifications.schedule({
        id: line.alertId,
        title: 'MapPauseForMe - Close to Pause!',
        //icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
        text: msg,
        data: { mydata: line },
        trigger: { in: totalSec, unit: ELocalNotificationTriggerUnit.SECOND },
        foreground: true // Show the notification while app is open
    });

    this.changeBellStyle("bellTimePause_" + index,true);
  }

  cancelTimeAlert(index, line) {
    console.log("Canceled Time Alert for " + line.alertId);
    this.localNotifications.cancel(line.alertId);
    this.changeBellStyle("bellTimePause_" + index,false);
  }

  calculateTimeScheduleInSeconds(line) {
    let minutes  = parseInt(line.timeToPause.split(":")[1]);
    let seconds  = parseInt(line.timeToPause.split(":")[2]);
    let totalSec = (minutes * 60) + seconds;
    return totalSec;
  }

  /* alertStateChanged(index) {
    let line        = this.alertLines[index];
    let stateBefore = this.initialStateAlert[index];
    let stateNow    = line.alert;

    if ( stateBefore != stateNow ) {
      // If the state Alert is now ON, create a new LocalNotification
      if ( stateNow ) {
        this.createTimeAlert(line);
      } else {
      // If the state Alert is now OFF, delete the LocalNotification  
        this.cancelTimeAlert(line);
      }
    }
  } */

  getAll() {
    this.localNotifications.getAll().then((res: ILocalNotification[]) => {
      console.log(res);
      this.scheduled = res;
    })
  }

  onClick() {
    this.getAll();
  }

  async openPicker(index) {
    const picker = await this.pickerCtrl.create({
      buttons: [
        {text: 'Cancel'},
        {text: 'Done', handler:(e) => { this.changeNauticalMilesValue(e,index) }}
      ],
      columns: [
        {
          name: 'NauticalMiles',
          options: this.optionsNm
        }
      ]
    });
    await picker.present();
  }

  changeNauticalMilesValue(e,index) {
    let newValue = e.NauticalMiles.value;
    let oldValue = this.alertLines[index].nmToPause;

    this.alertLines[index].nmToPause = newValue;

    // Clear the Alert
    if ( parseInt(newValue) == 0 && parseInt(oldValue) > 0 ) {
      this.cancelDistanceAlert(index, this.alertLines[index]);
    } else
    // Change the alert / Erase the Previous and Let the new one be created when receive data from X-Plane and detect the target distance notification
    if ( parseInt(newValue) > 0 && (parseInt(newValue) != parseInt(oldValue)) ) {
      this.cancelDistanceAlert(index, this.alertLines[index]);
      this.changeBellStyle("bellDistancePause_" + index,true); // Turn the "future" local notification ON
    }
  }

  createDistanceMessageAlert(line) {
    return 'We are close to the distance of ' 
              + line.nmToPause + ' nm to ' 
              + line.navaId + " (" 
              + line.distance + "nm <= " 
              + line.userDistance + "nm)";
  }

  createDistanceAlert(index, line) {
    let msg         = this.createDistanceMessageAlert(line);
    let idAlertDist = parseInt(line.alertId) + 10;
    console.log("Create Distance Alert for " + idAlertDist + " -> " + msg);

    this.localNotifications.schedule({
        id: idAlertDist,
        title: 'MapPauseForMe - Close to Pause!',
        //icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
        text: msg,
        data: { mydata: line },
        trigger: { in: 1, unit: ELocalNotificationTriggerUnit.SECOND },
        foreground: true // Show the notification while app is open
    });

    this.changeBellStyle("bellDistancePause_" + index,true);
  }

  cancelDistanceAlert(index, line) {
    let idAlertDist = parseInt(line.alertId) + 10;
    console.log("Canceled Distance Alert for " + idAlertDist);
    this.localNotifications.cancel(idAlertDist);
    this.changeBellStyle("bellDistancePause_" + index,false);
  }

  changeBellStyle(idElement:string, stateOn:boolean) {
    var bellElement = document.getElementById(idElement).firstElementChild;
    if ( stateOn ) {
      bellElement.setAttribute("class","fas fa-bell");
      bellElement.setAttribute("style","color:green;");
    } else {
      bellElement.setAttribute("class","fas fa-bell-slash");
      bellElement.setAttribute("style","color:black;");
    }
  }
}
