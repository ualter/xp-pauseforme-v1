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

  private minuteValues:string = "0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55";
  private alertLines: any = [];
  private initialStateAlert: any = [false,false,false,false,false]; 
  private scheduled:any = [];
  private subscription: Subscription;

  constructor(
    private platform: Platform,
    private pickerCtrl: PickerController,
    private localNotifications: LocalNotifications,
    private utils: UtilsService,
    private xpWsSocket: XpWebSocketService,
    private mapService: MapService) { 

      if ( platform.is("iphone") ) {
      }

      this.alertLines = [
        {
          "id": "Airport",
          "alert":false,
          "userSelected":false,
          "navaId":"LEBL",
          "distance": 266,
          "userDistance": 50,
          "estimatedPause":"01:43:32", 
          "timeToPause": "00:02:30",
          "units":" minutes"
        },
        {
          "id": "VOR",
          "alert":true,
          "userSelected":false,
          "navaId":"SLL",
          "distance": 320,
          "userDistance": 53,
          "estimatedPause":"01:33:12", 
          "timeToPause": "00:02:30",
          "units":" minutes"
        },
        {
          "id": "NDB",
          "alert":false,
          "userSelected":false,
          "navaId":"TOLUS",
          "distance": 123,
          "userDistance": 23,
          "estimatedPause":"00:23:02", 
          "timeToPause": "00:02:30",
          "units":" minutes"
        },
        {
          "id": "Fix",
          "alert":false,
          "userSelected":false,
          "navaId":"VEKKO",
          "distance": 54,
          "userDistance": 50,
          "estimatedPause":"02:30:02", 
          "timeToPause": "00:01:30",
          "units":" minutes"
        },
        {
          "id": "DME",
          "alert":false,
          "userSelected":false,
          "navaId":"SLE",
          "distance": 77,
          "userDistance": 20,
          "estimatedPause":"01:10:58", 
          "timeToPause": "00:03:00",
          "units":" minutes"
        }
      ];

      //this.getAll();
      //this.initialStateAlert[1] = true;

      /* this.platform.ready().then(() => {
        // Local Notifications Events
        // Events Supported: add, trigger, click, clear, cancel, update, clearall and cancelall
        this.localNotifications.on('click').subscribe(res => {
          let msg = res.data ? 'CLICK -> ' + res.data.mydata : 'CLICK -> Not Found mydata object';
        });
        this.localNotifications.on('trigger').subscribe(res => {
          let msg = res.data ? 'TRIGGER -> ' + res.data.mydata : 'TRIGGER -> Not Found mydata object';
        });
      }); */

      this.subscription = this.xpWsSocket.messageStream().subscribe (
          json => {
            var json = JSON.parse(json);
            console.log("json received");
            if ( json.airplane ) {
              this.alertLines[0].alert          = json.airplane.pauseforme.navaid.config.selected.airport;
              this.alertLines[0].userSelected   = json.airplane.pauseforme.navaid.config.selected.airport;
              this.alertLines[0].navaId         = json.airplane.pauseforme.navaid.config.id.airport;
              this.alertLines[0].distance       = json.airplane.pauseforme.navaid.config.distance.airport;
              this.alertLines[0].userDistance   = json.airplane.pauseforme.navaid.userAirportDistance;
              this.alertLines[0].estimatedPause = this.mapService.etaPauseByNavaIdAirport;

              this.alertLines[1].alert          = json.airplane.pauseforme.navaid.config.selected.vor;
              this.alertLines[1].userSelected   = json.airplane.pauseforme.navaid.config.selected.vor;
              this.alertLines[1].navaId         = json.airplane.pauseforme.navaid.config.id.vor;
              this.alertLines[1].distance       = json.airplane.pauseforme.navaid.config.distance.vor;
              this.alertLines[1].userDistance   = json.airplane.pauseforme.navaid.userVORDistance;
              this.alertLines[1].estimatedPause = this.mapService.etaPauseByNavaIdVor;

              this.alertLines[2].alert          = json.airplane.pauseforme.navaid.config.selected.ndb;
              this.alertLines[2].userSelected   = json.airplane.pauseforme.navaid.config.selected.ndb;
              this.alertLines[2].navaId         = json.airplane.pauseforme.navaid.config.id.ndb;
              this.alertLines[2].distance       = json.airplane.pauseforme.navaid.config.distance.ndb;
              this.alertLines[2].userDistance   = json.airplane.pauseforme.navaid.userNDBDistance;
              this.alertLines[2].estimatedPause = this.mapService.etaPauseByNavaIdNdb;

              this.alertLines[3].alert          = json.airplane.pauseforme.navaid.config.selected.fix;
              this.alertLines[3].userSelected   = json.airplane.pauseforme.navaid.config.selected.fix;
              this.alertLines[3].navaId         = json.airplane.pauseforme.navaid.config.id.fix;
              this.alertLines[3].distance       = json.airplane.pauseforme.navaid.config.distance.fix;
              this.alertLines[3].userDistance   = json.airplane.pauseforme.navaid.userFixDistance;
              this.alertLines[3].estimatedPause = this.mapService.etaPauseByNavaIdFix;

              this.alertLines[4].alert          = json.airplane.pauseforme.navaid.config.selected.dme;
              this.alertLines[4].userSelected   = json.airplane.pauseforme.navaid.config.selected.dme;
              this.alertLines[4].navaId         = json.airplane.pauseforme.navaid.config.id.dme;
              this.alertLines[4].distance       = json.airplane.pauseforme.navaid.config.distance.dme;
              this.alertLines[4].userDistance   = json.airplane.pauseforme.navaid.userDMEDistance;
              this.alertLines[4].estimatedPause = this.mapService.etaPauseByNavaIdDme;
            }
          },
          error => {
            this.utils.error('Oops', error)
          }
      );

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  minuteSecondChanged(index) {
    let line = this.alertLines[index];
    let min  = line.timeToPause.split(":")[1];
    if ( parseInt(min) == 0 ) {
      line.units = " seconds";
    } else 
    if ( parseInt(min) == 1 ) {
      line.units = " minute";
    } else {
      line.units = " minutes";
    }
    
    // Remove the previous and create the new with the new values
    this.cancelAlert(line);
    // Recreate the Alert (update)
    this.createAlert(line);
  }

  createAlert(line) {
    let msg = this.createMessageAlert(line);
    console.log(msg);

    let totalSec = this.calculateTimeScheduleInSeconds(line);
    console.log(totalSec);

    /* this.localNotifications.schedule({
        id: line.id,
        title: 'MapPauseForMe - Close to Pause!',
        //icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
        text: msg,
        data: { mydata: line },
        trigger: { in: totalSec, unit: ELocalNotificationTriggerUnit.SECOND },
        foreground: true // Show the notification while app is open
    }); */
  }

  createMessageAlert(line) {
    return 'We are close... ' 
              + line.timeToPause.substr(3) + ' ' 
              + line.units + ' and counting to Pause X-Plane, reason: ' 
              + line.navaId + " " 
              + line.distance + "nm <= " 
              + line.userDistance + "nm";
  }

  calculateTimeScheduleInSeconds(line) {
    let minutes  = parseInt(line.timeToPause.split(":")[1]);
    let seconds  = parseInt(line.timeToPause.split(":")[2]);
    let totalSec = (minutes * 60) + seconds;
    return totalSec;
  }

  alertChanged(index) {
    let line        = this.alertLines[index];
    let stateBefore = this.initialStateAlert[index];
    let stateNow    = line.alert;

    if ( stateBefore != stateNow ) {
      // If the state Alert is now ON, create a new LocalNotification
      if ( stateNow ) {
        this.createAlert(line);
      } else {
      // If the state Alert is now OFF, delete the LocalNotification  
        this.cancelAlert(line);
      }
    }
  }

  getAll() {
    this.localNotifications.getAll().then((res: ILocalNotification[]) => {
      this.scheduled = res;
    })
  }

  cancelAlert(line) {
    console.log("Canceled Alert for " + line.id);
    //this.localNotifications.cancel(line.id);
  }
  

}
