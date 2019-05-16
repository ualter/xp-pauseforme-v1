import { Component, OnInit, ViewChild } from '@angular/core';
import { PickerController, Platform } from '@ionic/angular';
import { LocalNotifications, ELocalNotificationTriggerUnit, ILocalNotification } from '@ionic-native/local-notifications/ngx';
import { XpWebSocketService } from 'src/app/services/xp-websocket.service';
import { UtilsService } from '../../services/utils.service';
import { MapService } from '../../services/map.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { notifications } from '../../services/notification';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  optionsNm: any = [];
  minuteValues:string = "0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55";
  alertLines: any = [];
  scheduled:any = [];
  
  private subscription: Subscription;
  notifications: notifications;

  constructor(
    private platform: Platform,
    private pickerCtrl: PickerController,
    private localNotifications: LocalNotifications,
    private utils: UtilsService,
    private xpWsSocket: XpWebSocketService,
    private mapService: MapService,
    private notificationService: NotificationService) { 

      for(let i = 0; i <= 100; i++) {
        this.optionsNm.push({text: '' + i,value: i});
      }

      if ( platform.is("iphone") ) {
      }

      this.alertLines = [
        {
          "index":0,
          "alertTimeId":1,
          "alertDistanceId":11,
          "id": "Airport",
          "userSelected":false,
          "navaId":"LEBL",
          "distance": 999,
          "userDistance": 0,
          "estimatedPause":"99:99:99", 
          "timeToPause": "00:00:00",
          "units":"min",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false,
          "alertTimeSchedule":false,
          "alertDistanceSchedule":false
        },
        {
          "index":1,
          "alertTimeId":2,
          "alertDistanceId":12,
          "id": "VOR",
          "userSelected":false,
          "navaId":"SLL",
          "distance": 999,
          "userDistance": 0,
          "estimatedPause":"99:99:99", 
          "timeToPause": "00:00:00",
          "units":"min",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false,
          "alertTimeSchedule":false,
          "alertDistanceSchedule":false
        },
        {
          "index":2,
          "alertTimeId":3,
          "alertDistanceId":13,
          "id": "NDB",
          "userSelected":false,
          "navaId":"TOLUS",
          "distance": 999,
          "userDistance": 0,
          "estimatedPause":"99:99:99", 
          "timeToPause": "00:00:00",
          "units":"min",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false,
          "alertTimeSchedule":false,
          "alertDistanceSchedule":false
        },
        {
          "index":3,
          "alertTimeId":4,
          "alertDistanceId":14,
          "id": "Fix",
          "userSelected":false,
          "navaId":"VEKKO",
          "distance": 999,
          "userDistance": 0,
          "estimatedPause":"99:99:99", 
          "timeToPause": "00:00:00",
          "units":"min",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false,
          "alertTimeSchedule":false,
          "alertDistanceSchedule":false
        },
        {
          "index":4,
          "alertTimeId":5,
          "alertDistanceId":15,
          "id": "DME",
          "userSelected":false,
          "navaId":"SLE",
          "distance": 999,
          "userDistance": 0,
          "estimatedPause":"99:99:99", 
          "timeToPause": "00:00:00",
          "units":"min",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false,
          "alertTimeSchedule":false,
          "alertDistanceSchedule":false
        }
      ];

      // Load the persitent configuration notifications (For exemple: Alarm must be set or not)
      this.notifications = this.notificationService.getNotifications();
      for(let i = 0; i < 5; i++) {
        this.alertLines[i].alertTimeId           = this.notifications.notification[i].alertTimeId;
        this.alertLines[i].alertDistanceId       = this.notifications.notification[i].alertDistanceId;
        this.alertLines[i].id                    = this.notifications.notification[i].id;
        this.alertLines[i].timeToPause           = this.notifications.notification[i].timeToPause;
        this.alertLines[i].nmToPause             = this.notifications.notification[i].nmToPause;
        this.alertLines[i].alertTimeSet          = this.notifications.notification[i].alertTimeSet;
        this.alertLines[i].alertDistanceSet      = this.notifications.notification[i].alertDistanceSet;          
        this.alertLines[i].alertTimeSchedule     = this.notifications.notification[i].alertTimeSchedule;
        this.alertLines[i].alertDistanceSchedule = this.notifications.notification[i].alertDistanceSchedule;          
        this.alertLines[i].units                 = this.defineUnits(this.notifications.notification[i].timeToPause);
      }
      
      this.platform.ready().then(() => {
        // Local Notifications Events
        // Events Supported: add, trigger, click, clear, cancel, update, clearall and cancelall
        this.localNotifications.on('click').subscribe(res => {
            let msg = res.data ? 'CLICK -> ' + res.data.mydata : 'CLICK -> Not Found mydata object';
            console.log(msg);
            console.log(res.data);
            console.log("Mydata==> " + res.data.mydata.alertTimeId + ", " + res.data.mydata.id);
        });
        this.localNotifications.on('trigger').subscribe(res => {
            let msg = res.data ? 'TRIGGER -> ' + res.data.mydata : 'TRIGGER -> Not Found mydata object';
            console.log(msg);
            console.log(res.data);
            console.log("Mydata==> " + res.data.mydata.alertTimeId + ", " + res.data.mydata.id);

            if ( res.data.mydata.alertTimeId > 0 ) {
              this.cancelTimeAlert(res.data.mydata.index,res.data.mydata);
            } else
            if ( res.data.mydata.alertDistanceId )  {
              this.cancelDistanceAlert(res.data.mydata.index,res.data.mydata);
            }
        });
      });

      this.subscription = this.xpWsSocket.messageStream().subscribe(
          json => {
            var json = JSON.parse(json);
            if ( json.airplane ) {
              this.alertLines[0].userSelected   = json.airplane.pauseforme.navaid.config.selected.airport;
              this.alertLines[0].navaId         = json.airplane.pauseforme.navaid.config.id.airport;
              this.alertLines[0].distance       = json.airplane.pauseforme.navaid.config.distance.airport;
              this.alertLines[0].userDistance   = json.airplane.pauseforme.navaid.userAirportDistance;
              this.alertLines[0].estimatedPause = this.mapService.etaPauseByNavaIdAirport;

              this.alertLines[1].userSelected   = json.airplane.pauseforme.navaid.config.selected.vor;
              this.alertLines[1].navaId         = json.airplane.pauseforme.navaid.config.id.vor;
              this.alertLines[1].distance       = json.airplane.pauseforme.navaid.config.distance.vor;
              this.alertLines[1].userDistance   = json.airplane.pauseforme.navaid.userVORDistance;
              this.alertLines[1].estimatedPause = this.mapService.etaPauseByNavaIdVor;

              this.alertLines[2].userSelected   = json.airplane.pauseforme.navaid.config.selected.ndb;
              this.alertLines[2].navaId         = json.airplane.pauseforme.navaid.config.id.ndb;
              this.alertLines[2].distance       = json.airplane.pauseforme.navaid.config.distance.ndb;
              this.alertLines[2].userDistance   = json.airplane.pauseforme.navaid.userNDBDistance;
              this.alertLines[2].estimatedPause = this.mapService.etaPauseByNavaIdNdb;

              this.alertLines[3].userSelected   = json.airplane.pauseforme.navaid.config.selected.fix;
              this.alertLines[3].navaId         = json.airplane.pauseforme.navaid.config.id.fix;
              this.alertLines[3].distance       = json.airplane.pauseforme.navaid.config.distance.fix;
              this.alertLines[3].userDistance   = json.airplane.pauseforme.navaid.userFixDistance;
              this.alertLines[3].estimatedPause = this.mapService.etaPauseByNavaIdFix;

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

  ngAfterViewInit() {  
    for(let i = 0; i < 5; i++) {
      if ( this.alertLines[i].alertTimeSchedule ) {
        this.changeBellStyle("bellTimePause_" + i,true);
      }

      if ( this.alertLines[i].alertDistanceSchedule ) {
        this.changeBellStyle("bellDistancePause_" + i,true);
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  defineUnits(timeToPause) {
    let units = "xx";
    let min   = parseInt(timeToPause.split(":")[1]);
    let sec   = parseInt(timeToPause.split(":")[2]);
    if ( min == 0 ) {
      units = "sec";
    } else 
    if ( min == 1 ) {
      units = "min";
    } else {
      units = "min";
    }
    return units;
  }
  
  minuteSecondChanged(index) {
    let line   = this.alertLines[index];
    let min    = parseInt(line.timeToPause.split(":")[1]);
    let sec    = parseInt(line.timeToPause.split(":")[2]);
    line.units = this.defineUnits(line.timeToPause);
    
    // Remove the previous and create the new with the new values
    this.cancelTimeAlert(index,line);

    if ( min > 0 || sec > 0 ) {
      this.changeBellStyle("bellTimePause_" + index,true);
      this.notifications.notification[index].timeToPause  = this.alertLines[index].timeToPause;
      this.notifications.notification[index].alertTimeSchedule = true;
      this.notificationService.saveNotifications();
    }
  }

  cancelTimeAlert(index, line) {
    console.log("Canceled Time Alert for " + line.alertTimeId);
    this.localNotifications.cancel(line.alertTimeId);
    this.alertLines[index].alertTimeSet      = false;
    this.alertLines[index].alertTimeSchedule = false;
    this.changeBellStyle("bellTimePause_" + index,false);

    this.notifications.notification[index].timeToPause       = "00:00:00";
    this.notifications.notification[index].alertTimeSet      = false;
    this.notifications.notification[index].alertTimeSchedule = false;
    this.notificationService.saveNotifications();
  }

  calculateTimeScheduleInSeconds(line) {
    let minutes  = parseInt(line.timeToPause.split(":")[1]);
    let seconds  = parseInt(line.timeToPause.split(":")[2]);
    let totalSec = (minutes * 60) + seconds;
    return totalSec;
  }

  getAll() {
    this.localNotifications.getAll().then((res: ILocalNotification[]) => {
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
      // Save the configuration
      this.notifications.notification[index].nmToPause             = this.alertLines[index].nmToPause;
      this.notifications.notification[index].alertDistanceSchedule = true;
      this.notificationService.saveNotifications();
    }
  }

  createDistanceMessageAlert(line) {
    return 'We are close to the distance of ' 
              + line.nmToPause + ' nm to ' 
              + line.navaId + " (" 
              + line.distance + "nm <= " 
              + line.userDistance + "nm)";
  }

  cancelDistanceAlert(index, line) {
    let idAlertDist = parseInt(line.alertDistanceId);
    console.log("Canceled Distance Alert for " + idAlertDist);
    this.localNotifications.cancel(idAlertDist);
    this.alertLines[index].alertDistanceSet      = false;
    this.alertLines[index].alertDistanceSchedule = false;
    this.changeBellStyle("bellDistancePause_" + index,false);

    this.notifications.notification[index].nmToPause             = 0;
    this.notifications.notification[index].alertDistanceSet      = false;
    this.notifications.notification[index].alertDistanceSchedule = false;
    this.notificationService.saveNotifications();
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
