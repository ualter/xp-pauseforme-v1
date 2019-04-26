import { XpWebSocketService } from './../../services/xp-websocket.service';
import { UtilsService } from './../../services/utils.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';

const WS_OPEN = 1;

@Component({
  selector: 'app-pause-for-me',
  templateUrl: './pause-for-me.page.html',
  styleUrls: ['./pause-for-me.page.scss'],
})
export class PauseForMePage implements OnInit, OnDestroy {

  MIN_DIST_NAVAID       = 3;
  MAX_DIST_NAVAID       = 999;
  STEP_NAVAID           = 1;
  ICON_SEPARATOR_NAVAID = "at";

  timeImg:string;
  airportId:string   = "LEBL";
  vorId:string       = "SLL";
  ndbId:string       = "VNV";
  fixId:string       = "VIBOK";
  dmeId:string       = "BCN";
  airportDist:number = 999;
  vorDist:number     = 999;
  ndbDist:number     = 999;
  fixDist:number     = 999;
  dmeDist:number     = 999;
  currentAirportDist:number = 999;
  currentVorDist:number     = 999;
  currentNdbDist:number     = 999;
  currentFixDist:number     = 999;
  currentDmeDist:number     = 999;
  altitudeKnobValues:{ upper:number,lower:number } = {
    upper:28000,
    lower:10000
  }
  airspeedKnobValues:{ upper:number,lower:number } = {
    upper:320,
    lower:150
  }
  time = "22:10";
  currentTime = "99:99";

  currentAltitude:number = 0;
  currentAirspeed:number = 0;

  static reloj: number = 2;

  constructor(private xpWsSocket: XpWebSocketService, 
              private alertCtrl: AlertController,
              private utils: UtilsService,
              private xpWebSocket: XpWebSocketService) {

    if ( PauseForMePage.reloj == 1 ) {
      PauseForMePage.reloj = 2;
    } else {
      PauseForMePage.reloj = 1;
    }
    this.timeImg = "time" + PauseForMePage.reloj + ".png";

    if ( this.xpWebSocket.getLastMessageReceive() ) {
      var json       = JSON.parse(this.xpWebSocket.getLastMessageReceive());
      let pauseForMe = json.airplane.pauseforme;

      this.altitudeKnobValues.lower = pauseForMe.altitude.min;
      this.altitudeKnobValues.upper = pauseForMe.altitude.max;
      this.airspeedKnobValues.lower = pauseForMe.speed.min;
      this.airspeedKnobValues.upper = pauseForMe.speed.max;
      this.airportId                = pauseForMe.navaid.config.id.airport;
      this.vorId                    = pauseForMe.navaid.config.id.vor;
      this.fixId                    = pauseForMe.navaid.config.id.fix;
      this.ndbId                    = pauseForMe.navaid.config.id.ndb;
      this.dmeId                    = pauseForMe.navaid.config.id.dme;
      this.airportDist              = pauseForMe.navaid.userAirportDistance;
      this.vorDist                  = pauseForMe.navaid.userVORDistance;
      this.ndbDist                  = pauseForMe.navaid.userNDBDistance;
      this.fixDist                  = pauseForMe.navaid.userFixDistance;
      this.dmeDist                  = pauseForMe.navaid.userDMEDistance;
      this.time                     = pauseForMe.timePause;
    }

    if ( this.xpWebSocket.observable() ) {
      this.xpWsSocket.observable().subscribe(
          payload => {
            var json = JSON.parse(payload.data);
            if ( json.airplane ) {
              this.currentAltitude    = json.airplane.currentAltitude;
              this.currentAirspeed    = json.airplane.airspeed;
              this.currentAirportDist = json.airplane.pauseforme.navaid.config.distance.airport;
              this.currentVorDist     = json.airplane.pauseforme.navaid.config.distance.vor;
              this.currentFixDist     = json.airplane.pauseforme.navaid.config.distance.fix;
              this.currentNdbDist     = json.airplane.pauseforme.navaid.config.distance.ndb;
              this.currentDmeDist     = json.airplane.pauseforme.navaid.config.distance.dme;
              this.currentTime        = this.utils.formatCurrentTime(json.airplane.time);
            }
          },
          error => {
            this.utils.error('Oops', error)
          }
      );
    }

  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    /* console.log('ionViewWillEnter');
    let elIonContent = document.getElementsByTagName("ion-content")[0];
    console.log(elIonContent);
    let elMainDiv    = elIonContent.shadowRoot.querySelector("div");
    console.log(elMainDiv);
    (<Element>elMainDiv).setAttribute('style',"background-image: url('assets/imgs/background_1.png');"); */
  }

  ngOnDestroy() {
  }

  randomNumber(max, min) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  sendAltitude() {
    var msg = "{CONFIG_PAUSE_ALTITUDE}|{CONFIG_PAUSE_ALTITUDE}|" + this.altitudeKnobValues.lower + "|" + this.altitudeKnobValues.upper;
    this.sendMessageXPlane(msg);
  }
  sendAirspeed() {
    var msg = "{CONFIG_PAUSE_AIRSPEED}|{CONFIG_PAUSE_AIRSPEED}|" + this.airspeedKnobValues.lower + "|" + this.airspeedKnobValues.upper;
    this.sendMessageXPlane(msg);
  }
  sendTime() {
    var msg = "{CONFIG_PAUSE_TIME}|" + this.time;
    this.sendMessageXPlane(msg);
  }

  sendNavaid(id,type,dist) {
    var msg = "{CONFIG_PAUSE_NAVAID}|" + id + "|" + type + "|" + dist;
    this.sendMessageXPlane(msg);
  }

  sendMessageXPlane(message) {
    console.log(message);
    if ( this.xpWsSocket.getWebSocket() && this.xpWsSocket.getWebSocket().readyState == WS_OPEN ) {
      this.xpWsSocket.getWebSocket().send(message);
      this.utils.info("Sent to X-Plane: " + message);
    } else {
      this.presentAlert({
        header: 'Warning',
        subHeader: 'X-Plane Connection',
        mode:'ios',
        animated: 'true',
        translucent: ' true',
        message: `
          You are not connected right now!
        `,
        buttons: [
          {
            text: ' OK ',
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
    }
  }

  async presentAlert(msgAlert) {
    const alert = await this.alertCtrl.create(msgAlert);
    await alert.present(); 
  }

}
