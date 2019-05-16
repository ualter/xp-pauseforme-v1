import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { UtilsService } from "./utils.service";
import { notifications } from './notification';

export enum NotificationIndex {
  AIRPORT  = 0,
  VOR      = 1,
  NDB      = 2,
  FIX      = 3,
  DME      = 4
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notifications: notifications;

  constructor(private storage: Storage, private utils: UtilsService) { 

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
        "alertDistanceSet":false
      },
      {
        "index":NotificationIndex.VOR,
        "alertTimeId":2,
        "alertDistanceId":12,
        "id": "VOR",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false
      },
      {
        "index":NotificationIndex.NDB,
        "alertTimeId":3,
        "alertDistanceId":13,
        "id": "NDB",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false
      },
      {
        "index":NotificationIndex.FIX,
        "alertTimeId":4,
        "alertDistanceId":14,
        "id": "Fix",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false
      },
      {
        "index":NotificationIndex.DME,
        "alertTimeId":5,
        "alertDistanceId":15,
        "id": "DME",
        "timeToPause": "00:00:00",
        "nmToPause":0,
        "alertTimeSet":false,
        "alertDistanceSet":false
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

  checkTriggerDistanceAlertNotification(jsonAirplane: any) {

    
    // AIRPORT
    if ( jsonAirplane.pauseforme.navaid.config.selected.airport == 1 ) {
      // Distance alarm set?
      if ( this.notifications.notification[NotificationIndex.AIRPORT].alertDistanceSet ) {
        let currentDistance = jsonAirplane.pauseforme.navaid.config.distance.airport;
        let notificDistance = this.notifications.notification[NotificationIndex.AIRPORT].nmToPause;
      }
      // Time alarm set?
      if ( this.notifications.notification[NotificationIndex.AIRPORT].alertTimeSet ) {

      }
    }

    

    if (notificDistance > 0 && !this.notifications.notification[index].alertDistanceSet ) {
      if (currentDistance <= notificDistance) {
        this.createDistanceAlert(index, this.alertLines[index]); 
      }
    }
  }

  createDistanceAlert(index: NotificationIndex, nmToPause, navaId, distance, userDistance) {
    let msg         = this.createDistanceMessageAlert(nmToPause, navaId, distance, userDistance);
    let idAlertDist = this.notifications.notification[index].alertDistanceId;
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

  createDistanceMessageAlert(nmToPause, navaId, distance, userDistance) {
    return 'We are close to the distance of ' 
              + nmToPause + ' nm to ' 
              + navaId + " (" 
              + distance + "nm <= " 
              + userDistance + "nm)";
  }
}
