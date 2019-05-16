import { MapService } from './map.service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { UtilsService } from "./utils.service";
import { notifications } from './notification';
import { LocalNotifications, ELocalNotificationTriggerUnit, ILocalNotification } from '@ionic-native/local-notifications/ngx';

export enum NotificationIndex {
  AIRPORT  = 0,
  VOR      = 1,
  NDB      = 2,
  FIX      = 3,
  DME      = 4
};

export enum AlertType {
  TIME = 0,
  DISTANCE = 1
}
export class AlertMessage {
  id: number;
  index: number;
  typeAlert: AlertType;
  navaId: string;
  nmToPause: number;
  distance: string;
  userDistance: string;
  timeToPause: string;
  estimatedPause: string;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notifications: notifications;

  constructor(private storage: Storage, 
              private utils: UtilsService,
              private mapService: MapService,
              private localNotifications: LocalNotifications) { 

    this.notifications = new notifications();
    this.notifications.notification = [
      {
        "index":NotificationIndex.AIRPORT,
        "alertTimeId":1,
        "alertDistanceId":11,
        "id": "Airport",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false,
        "alertTimeSchedule": false,
        "alertDistanceSchedule": false
      },
      {
        "index":NotificationIndex.VOR,
        "alertTimeId":2,
        "alertDistanceId":12,
        "id": "VOR",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false,
        "alertTimeSchedule": false,
        "alertDistanceSchedule": false
      },
      {
        "index":NotificationIndex.NDB,
        "alertTimeId":3,
        "alertDistanceId":13,
        "id": "NDB",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false,
        "alertTimeSchedule": false,
        "alertDistanceSchedule": false
      },
      {
        "index":NotificationIndex.FIX,
        "alertTimeId":4,
        "alertDistanceId":14,
        "id": "Fix",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false,
        "alertTimeSchedule": false,
        "alertDistanceSchedule": false
      },
      {
        "index":NotificationIndex.DME,
        "alertTimeId":5,
        "alertDistanceId":15,
        "id": "DME",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false,
        "alertTimeSchedule": false,
        "alertDistanceSchedule": false
      }
    ];

    this.storage.get('notifications').then((vlr) => {
      if (vlr) {
          this.utils.trace("Load notifications data from LocalStorage:" + vlr);                
          this.notifications = JSON.parse(vlr);
      } else {
          this.saveNotifications();
      }
    });
  }

  getNotifications() {
    return this.notifications;
  }

  saveNotifications() {
      this.storage.set('notifications',JSON.stringify(this.notifications));
  }

  createRandomAlertId() {
    return Math.round(Math.random() * 10000000);
  }

  checkAlertNotification(jsonAirplane: any) {
    let currentDistance;
    let estimatedTime;

    if ( jsonAirplane.pauseforme.navaid.config.selected.airport == 1 ) {
        currentDistance = jsonAirplane.pauseforme.navaid.config.distance.airport;
        this.checkDistanceAlertNotification(NotificationIndex.AIRPORT,currentDistance, jsonAirplane);

        estimatedTime = this.mapService.etaPauseByNavaIdAirport;
        this.checkTimeAlertNotification(estimatedTime, NotificationIndex.AIRPORT, jsonAirplane, currentDistance);
    }

    if ( jsonAirplane.pauseforme.navaid.config.selected.vor == 1 ) {
        currentDistance = jsonAirplane.pauseforme.navaid.config.distance.vor;
        this.checkDistanceAlertNotification(NotificationIndex.VOR,currentDistance, jsonAirplane);

        estimatedTime = this.mapService.etaPauseByNavaIdVor;
        this.checkTimeAlertNotification(estimatedTime, NotificationIndex.VOR, jsonAirplane, currentDistance);
    }

    if ( jsonAirplane.pauseforme.navaid.config.selected.ndb == 1 ) {
        currentDistance = jsonAirplane.pauseforme.navaid.config.distance.ndb;
        this.checkDistanceAlertNotification(NotificationIndex.NDB,currentDistance, jsonAirplane);

        estimatedTime = this.mapService.etaPauseByNavaIdNdb;
        this.checkTimeAlertNotification(estimatedTime, NotificationIndex.NDB, jsonAirplane, currentDistance);
    }

    if ( jsonAirplane.pauseforme.navaid.config.selected.fix == 1 ) {
        currentDistance = jsonAirplane.pauseforme.navaid.config.distance.fix;
        this.checkDistanceAlertNotification(NotificationIndex.FIX,currentDistance, jsonAirplane);

        estimatedTime = this.mapService.etaPauseByNavaIdFix;
        this.checkTimeAlertNotification(estimatedTime, NotificationIndex.FIX, jsonAirplane, currentDistance);
    }

    if ( jsonAirplane.pauseforme.navaid.config.selected.dme == 1 ) {
        currentDistance = jsonAirplane.pauseforme.navaid.config.distance.dme;
        this.checkDistanceAlertNotification(NotificationIndex.DME,currentDistance, jsonAirplane);

        estimatedTime = this.mapService.etaPauseByNavaIdDme;
        this.checkTimeAlertNotification(estimatedTime, NotificationIndex.DME, jsonAirplane, currentDistance);
    }
  }

  private checkTimeAlertNotification(estimatedTime: string, index: NotificationIndex, jsonAirplane: any, currentDistance: any) {
    // Is Time Alert set and The Time Alert Notification was not yet scheduled?
    if (this.notifications.notification[index].timeToPause != "00:00:00" &&
      !this.notifications.notification[index].alertTimeSet) {

      
      let notificationTime = this.notifications.notification[index].timeToPause;
      let secondsToTrigger = this.calculateAlertTime(estimatedTime, notificationTime);
      if (secondsToTrigger < 0) {
        secondsToTrigger = 0;
      }
      // If 5 minutes to the Alarm, we'll schedule it to trigger latter
      if (secondsToTrigger <= 300) {
        console.log("Set Time Alarm to trigger in " + secondsToTrigger + " seconds");
        let alertMessage            = new AlertMessage();
        alertMessage.id             = index + 1;//this.createRandomAlertId();
        alertMessage.typeAlert      = AlertType.TIME;
        alertMessage.index          = index;
        alertMessage.timeToPause    = notificationTime;
        alertMessage.estimatedPause = estimatedTime;
        alertMessage.distance       = currentDistance;

        this.fillSpecificAttributesMessage(index, alertMessage, jsonAirplane);

        if (this.createAlert(alertMessage, this.createTimeMessageAlert(alertMessage), secondsToTrigger)) {
          this.notifications.notification[index].alertTimeSet = true;
          this.saveNotifications();
        }
      }
    }
  }

  private checkDistanceAlertNotification(index: NotificationIndex, currentDistance: any, jsonAirplane: any) {
    // Is Distance Alert set and The Distance Alert Notification was not yet scheduled?
    if (this.notifications.notification[index].nmToPause > 0 &&
        !this.notifications.notification[index].alertDistanceSet) {

        let notificationDistance    = this.notifications.notification[index].nmToPause;
        // The current distance is less or equal the requested notification distance?
        if (currentDistance <= notificationDistance) {
            let alertMessage          = new AlertMessage();
            alertMessage.id           = index + 11;//this.createRandomAlertId();
            alertMessage.typeAlert    = AlertType.DISTANCE;
            alertMessage.index        = index;
            alertMessage.nmToPause    = notificationDistance;
            alertMessage.distance     = currentDistance;

            this.fillSpecificAttributesMessage(index, alertMessage, jsonAirplane);

            if (this.createAlert(alertMessage, this.createDistanceMessageAlert(alertMessage), 1)) {
              this.notifications.notification[index].alertDistanceSet = true;
              this.saveNotifications();
            }
      }
    }
  }

  fillSpecificAttributesMessage(index: NotificationIndex, alertMessage: AlertMessage, jsonAirplane: any) {
    if ( NotificationIndex.AIRPORT == index ) {
      alertMessage.navaId       = jsonAirplane.pauseforme.navaid.config.id.airport;
      alertMessage.userDistance = jsonAirplane.pauseforme.navaid.userAirportDistance;
    } else
    if ( NotificationIndex.VOR == index ) {
      alertMessage.navaId       = jsonAirplane.pauseforme.navaid.config.id.vor;
      alertMessage.userDistance = jsonAirplane.pauseforme.navaid.userVORDistance;
    } else
    if ( NotificationIndex.NDB == index ) {
      alertMessage.navaId       = jsonAirplane.pauseforme.navaid.config.id.ndb;
      alertMessage.userDistance = jsonAirplane.pauseforme.navaid.userNDBDistance;
    } else
    if ( NotificationIndex.FIX == index ) {
      alertMessage.navaId       = jsonAirplane.pauseforme.navaid.config.id.fix;
      alertMessage.userDistance = jsonAirplane.pauseforme.navaid.userFixDistance;
    } else
    if ( NotificationIndex.DME == index ) {
      alertMessage.navaId       = jsonAirplane.pauseforme.navaid.config.id.dme;
      alertMessage.userDistance = jsonAirplane.pauseforme.navaid.userDMEDistance;
    }

  }

  createAlert(alertMessage: AlertMessage, msg: string, triggerSeconds: number) {
    console.log("Creating alert for " + alertMessage.id + " -> " + msg);

    this.localNotifications.schedule({
        id: alertMessage.id,
        title: 'MapPauseForMe - Close to Pause!',
        //icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
        text: msg,
        data: { mydata: alertMessage },
        trigger: { in: triggerSeconds, unit: ELocalNotificationTriggerUnit.SECOND },
        foreground: true // Show the notification while app is open
    });

    return true;
  }

  createDistanceMessageAlert(alertMessage: AlertMessage) {
    return 'We are close to the distance of ' 
              + alertMessage.nmToPause + ' nm to ' 
              + alertMessage.navaId + " (" 
              + alertMessage.distance + "nm <= " 
              + alertMessage.userDistance + "nm)";
  }

  createTimeMessageAlert(alertMessage: AlertMessage) {
    let units = "xx";
    let min   = parseInt(alertMessage.timeToPause.split(":")[1]);
    let sec   = parseInt(alertMessage.timeToPause.split(":")[2]);
    if ( min == 0 ) {
      units = "sec";
    } else 
    if ( min == 1 ) {
      units = "min";
    } else {
      units = "min";
    }

    return 'We are close to the estimated time of ' 
              + alertMessage.timeToPause.substr(3) + ' ' + units + ' to pause X-Plane (' 
              + alertMessage.navaId + " " 
              + alertMessage.distance + "nm <= " 
              + alertMessage.userDistance + "nm)";
  }

  calculateAlertTime(estimatedTime, requestedPauseTime) {
	  let f        = '01/01/2019 ';
    let milisecs = Date.parse(f + estimatedTime) - Date.parse(f + requestedPauseTime);
    return (milisecs / 1000);
  }

  compareAlerts(t1, t2) {
    let f = '01/01/2019 ';
    if ( Date.parse(f + t1) > Date.parse(f + t2) ) return  1;
    if ( Date.parse(f + t1) < Date.parse(f + t2) ) return -1;
    return 0;
  }
}
