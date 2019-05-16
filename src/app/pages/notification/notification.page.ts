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

  COLOR_ICONS_SELECTION: string = "warning";

  optionsNm: any = [];
  minuteValues:string = "0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55";
  alertLines: any = [];
  initialStateAlert: any = [false,false,false,false,false]; 
  scheduled:any = [];
  threadNotificationInterval;
  
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
          "userSelected":true,
          "navaId":"LEBL",
          "distance": 266,
          "userDistance": 50,
          "estimatedPause":"01:43:32", 
          "timeToPause": "00:00:00",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false
        },
        {
          "index":1,
          "alertTimeId":2,
          "alertDistanceId":12,
          "id": "VOR",
          "userSelected":false,
          "navaId":"SLL",
          "distance": 320,
          "userDistance": 53,
          "estimatedPause":"01:33:12", 
          "timeToPause": "00:00:00",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false
        },
        {
          "index":2,
          "alertTimeId":3,
          "alertDistanceId":13,
          "id": "NDB",
          "userSelected":true,
          "navaId":"TOLUS",
          "distance": 123,
          "userDistance": 23,
          "estimatedPause":"00:23:02", 
          "timeToPause": "00:00:00",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false
        },
        {
          "index":3,
          "alertTimeId":4,
          "alertDistanceId":14,
          "id": "Fix",
          "userSelected":false,
          "navaId":"VEKKO",
          "distance": 54,
          "userDistance": 50,
          "estimatedPause":"02:30:02", 
          "timeToPause": "00:00:00",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false
        },
        {
          "index":4,
          "alertTimeId":5,
          "alertDistanceId":15,
          "id": "DME",
          "userSelected":false,
          "navaId":"SLE",
          "distance": 77,
          "userDistance": 20,
          "estimatedPause":"01:10:58", 
          "timeToPause": "00:00:00",
          "nmToPause":0,
          "alertTimeSet":false,
          "alertDistanceSet":false
        }
      ];

      // Load the persitent configuration notifications (For exemple: Alarm must be set or not)
      this.notifications = this.notificationService.getNotifications();
      for(let i = 0; i < 5; i++) {
        this.alertLines[i].alertTimeId      = this.notifications.notification[i].alertTimeId;
        this.alertLines[i].alertDistanceId  = this.notifications.notification[i].alertDistanceId;
        this.alertLines[i].id               = this.notifications.notification[i].id;
        this.alertLines[i].timeToPause      = this.notifications.notification[i].timeToPause;
        this.alertLines[i].nmToPause        = this.notifications.notification[i].nmToPause;
        this.alertLines[i].alertTimeSet     = this.notifications.notification[i].alertTimeSet;
        this.alertLines[i].alertDistanceSet = this.notifications.notification[i].alertDistanceSet;          
      }
      

      /* this.loadNotifications();
      // Monitoring all the Local Notifications and feed the array to show at the screen
      this.threadNotificationInterval = setInterval(() => {
        this.loadNotifications();
      }, 2000); */
      
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
              this.checkTriggerTimeAlertNotification(0);
              this.checkTriggerDistanceAlertNotification(0);

              this.alertLines[1].userSelected   = json.airplane.pauseforme.navaid.config.selected.vor;
              this.alertLines[1].navaId         = json.airplane.pauseforme.navaid.config.id.vor;
              this.alertLines[1].distance       = json.airplane.pauseforme.navaid.config.distance.vor;
              this.alertLines[1].userDistance   = json.airplane.pauseforme.navaid.userVORDistance;
              this.alertLines[1].estimatedPause = this.mapService.etaPauseByNavaIdVor;
              this.checkTriggerTimeAlertNotification(1);
              this.checkTriggerDistanceAlertNotification(1);

              this.alertLines[2].userSelected   = json.airplane.pauseforme.navaid.config.selected.ndb;
              this.alertLines[2].navaId         = json.airplane.pauseforme.navaid.config.id.ndb;
              this.alertLines[2].distance       = json.airplane.pauseforme.navaid.config.distance.ndb;
              this.alertLines[2].userDistance   = json.airplane.pauseforme.navaid.userNDBDistance;
              this.alertLines[2].estimatedPause = this.mapService.etaPauseByNavaIdNdb;
              this.checkTriggerTimeAlertNotification(2);
              this.checkTriggerDistanceAlertNotification(2);

              this.alertLines[3].userSelected   = json.airplane.pauseforme.navaid.config.selected.fix;
              this.alertLines[3].navaId         = json.airplane.pauseforme.navaid.config.id.fix;
              this.alertLines[3].distance       = json.airplane.pauseforme.navaid.config.distance.fix;
              this.alertLines[3].userDistance   = json.airplane.pauseforme.navaid.userFixDistance;
              this.alertLines[3].estimatedPause = this.mapService.etaPauseByNavaIdFix;
              this.checkTriggerTimeAlertNotification(3);
              this.checkTriggerDistanceAlertNotification(3);

              this.alertLines[4].userSelected   = json.airplane.pauseforme.navaid.config.selected.dme;
              this.alertLines[4].navaId         = json.airplane.pauseforme.navaid.config.id.dme;
              this.alertLines[4].distance       = json.airplane.pauseforme.navaid.config.distance.dme;
              this.alertLines[4].userDistance   = json.airplane.pauseforme.navaid.userDMEDistance;
              this.alertLines[4].estimatedPause = this.mapService.etaPauseByNavaIdDme;
              this.checkTriggerTimeAlertNotification(4);
              this.checkTriggerDistanceAlertNotification(4);
            }
          },
          error => {
            this.utils.error('Oops', error)
          }
      );

  }

  ngAfterViewInit() {  
    for(let i = 0; i < 5; i++) {
      if ( this.alertLines[i].alertTimeSet ) {
        this.changeBellStyle("bellTimePause_" + i,true);
      }

      if ( this.alertLines[i].alertDistanceSet ) {
        this.changeBellStyle("bellDistancePause_" + i,true);
      }
    }
  }

  private loadNotifications() {
    this.getAll();
    if (this.scheduled.length > 0) {
      for (let i = 0; i < this.scheduled.length; i++) {
        var jsonData = JSON.parse(this.scheduled[i].data);
        for (let y = 1; y <= 5; y++) {
          if (jsonData.mydata.alertTimeId == y) {
            this.alertLines[y - 1].timeToPause = jsonData.mydata.timeToPause;
            this.alertLines[y - 1].alertTimeSet = true;
          }
          else {
            this.alertLines[y - 1].alertTimeSet = false;
          }
          if (jsonData.mydata.alertTimeId == (y + 10)) {
            this.alertLines[y - 1].nmToPause = jsonData.mydata.nmToPause;
            this.alertLines[y - 1].alertDistanceSet = true;
          }
          else {
            this.alertLines[y - 1].alertDistanceSet = false;
          }
          console.log(jsonData.mydata.id + " " + jsonData.mydata.timeToPause + " " + jsonData.mydata.nmToPause);
        }
      }
    }
    else {
      console.log("No notifications");
    }
  }

  private checkTriggerDistanceAlertNotification(index) {
    if (this.alertLines[index].nmToPause > 0 && !this.alertLines[index].alertDistanceSet ) {
      let currentDistance = this.alertLines[index].distance;
      let notificDistance = this.alertLines[index].nmToPause;
      if (currentDistance <= notificDistance) {
        this.createDistanceAlert(index, this.alertLines[index]); 
      }
    }
  }

  private checkTriggerTimeAlertNotification(index) {
    if (this.alertLines[index].timeToPause != "00:00:00" && !this.alertLines[index].alertTimeSet ) {
        let estimatedTime    = this.alertLines[index].estimatedPause;
        let notificationTime = this.alertLines[index].timeToPause;
        //let result           = this.compareAlerts(estimatedTime, notificationTime);
        let secondsToTrigger = this.calculateAlertTime(this.alertLines[index].estimatedPause, this.alertLines[index].timeToPause);
        if ( secondsToTrigger < 0 ) {
          secondsToTrigger = 0;
        }
        // If 5 minutes to the Alarm, we'll schedule it to trigger latter
        if ( secondsToTrigger <= 300 ) {
        //if ( result == -1 || result == 0 ) {
          console.log("Set Time Alarm to trigger in " + secondsToTrigger + " seconds");
          this.createTimeAlert(index, this.alertLines[index], secondsToTrigger);
        }
    }
  }

  compareAlerts(t1, t2) {
    let f = '01/01/2019 ';
    if ( Date.parse(f + t1) > Date.parse(f + t2) ) return  1;
    if ( Date.parse(f + t1) < Date.parse(f + t2) ) return -1;
    return 0;
  }

  calculateAlertTime(estimatedTime, requestedPauseTime) {
	  let f        = '01/01/2019 ';
    let milisecs = Date.parse(f + estimatedTime) - Date.parse(f + requestedPauseTime);
    return (milisecs / 1000);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.threadNotificationInterval);
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
      this.changeBellStyle("bellTimePause_" + index,true);
      this.notifications.notification[index].timeToPause  = this.alertLines[index].timeToPause;
      this.notifications.notification[index].alertTimeSet = true;
      this.notificationService.saveNotifications();
    }
  }

  createTimeMessageAlert(line) {
    return 'We are close to the estimated time of ' 
              + line.timeToPause.substr(3) + ' ' + line.units + ' to pause X-Plane (' 
              + line.navaId + " " 
              + line.distance + "nm <= " 
              + line.userDistance + "nm)";
  }

  createTimeAlert(index,line,triggerInSeconds) {
    let msg = this.createTimeMessageAlert(line);
    console.log("Create Time Alert for " + line.alertTimeId + " -> " + msg);

    let data = JSON.parse(JSON.stringify(line));
    data.alertDistanceId = 0;

    this.localNotifications.schedule({
        id: line.alertTimeId,
        title: 'MapPauseForMe - Close to Pause!',
        icon: 'file://assets/imgs/airplanes/airbus/airplane-a320.png',
        text: msg,
        data: { mydata: data },
        trigger: { in: triggerInSeconds, unit: ELocalNotificationTriggerUnit.SECOND },
        foreground: true // Show the notification while app is open
    });
  }

  cancelTimeAlert(index, line) {
    console.log("Canceled Time Alert for " + line.alertTimeId);
    this.localNotifications.cancel(line.alertTimeId);
    this.alertLines[index].alertTimeSet = false;
    this.changeBellStyle("bellTimePause_" + index,false);

    this.notifications.notification[index].timeToPause  = "00:00:00";
    this.notifications.notification[index].alertTimeSet = false;
    this.notificationService.saveNotifications();
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
      this.scheduled = res;
    })
  }

  onClick() {
    this.getAll();
  }
  onClick2() {
    this.createTimeAlert(0, this.alertLines[0],10);
    this.alertLines[0].timeToPause = "00:00:10";
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
      this.notifications.notification[index].nmToPause        = this.alertLines[index].nmToPause;
      this.notifications.notification[index].alertDistanceSet = true;
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

  createDistanceAlert(index, line) {
    let msg         = this.createDistanceMessageAlert(line);
    let idAlertDist = parseInt(line.alertDistanceId);
    console.log("Create Distance Alert for " + idAlertDist + " -> " + msg);

    let data = JSON.parse(JSON.stringify(line));
    data.alertTimeId = 0;

    this.localNotifications.schedule({
        id: idAlertDist,
        title: 'MapPauseForMe - Close to Pause!',
        //icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
        icon: 'file://assets/imgs/airplanes/airbus/airplane-a320.png',
        text: msg,
        data: { mydata: data },
        trigger: { in: 1, unit: ELocalNotificationTriggerUnit.SECOND },
        foreground: true // Show the notification while app is open
    });

    this.alertLines[index].alertDistanceSet = true;
    this.changeBellStyle("bellDistancePause_" + index,true);
  }

  cancelDistanceAlert(index, line) {
    let idAlertDist = parseInt(line.alertDistanceId);
    console.log("Canceled Distance Alert for " + idAlertDist);
    this.localNotifications.cancel(idAlertDist);
    this.alertLines[index].alertDistanceSet = false;
    this.changeBellStyle("bellDistancePause_" + index,false);

    this.notifications.notification[index].nmToPause        = 0;
    this.notifications.notification[index].alertDistanceSet = false;
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
