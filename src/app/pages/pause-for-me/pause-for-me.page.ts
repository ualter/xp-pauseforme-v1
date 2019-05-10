import { MapService } from './../../services/map.service';
import { XpWebSocketService } from './../../services/xp-websocket.service';
import { UtilsService } from './../../services/utils.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

const WS_OPEN = 1;

@Component({
  selector: 'app-pause-for-me',
  templateUrl: './pause-for-me.page.html',
  styleUrls: ['./pause-for-me.page.scss'],
})
export class PauseForMePage implements OnInit, OnDestroy {

  private MIN_DIST_NAVAID       = 3;
  private MAX_DIST_NAVAID       = 999;
  private STEP_NAVAID           = 1;
  private ICON_SEPARATOR_NAVAID = "at";
  private COLOR_ICONS_SELECTION: string = "warning";

  private timeImg:string;
  private airportId:string   = "LEBL";
  private vorId:string       = "SLL";
  private ndbId:string       = "VNV";
  private fixId:string       = "VIBOK";
  private dmeId:string       = "BCN";
  private airportDist:number = 999;
  private vorDist:number     = 999;
  private ndbDist:number     = 999;
  private fixDist:number     = 999;
  private dmeDist:number     = 999;
  private currentAirportDist:number = 999;
  private currentVorDist:number     = 999;
  private currentNdbDist:number     = 999;
  private currentFixDist:number     = 999;
  private currentDmeDist:number     = 999;
  private altitudeKnobValues:{ upper:number,lower:number } = {
    upper:28000,
    lower:10000
  }
  private airspeedKnobValues:{ upper:number,lower:number } = {
    upper:320,
    lower:150
  }
  private time = "22:15:00";
  private currentTime = "99:99:99";

  private currentAltitude:number = 0;
  private currentAirspeed:number = 0;

  private airportSelected: boolean = false;
  private vorSelected: boolean = false;
  private ndbSelected: boolean = false;
  private fixSelected: boolean = false;
  private dmeSelected: boolean = false;

  private altitudeSelected: boolean = false;
  private airspeedSelected: boolean = false;
  private timeSelected: boolean = false;

  private subscription: Subscription;

  static reloj: number = 2;

  constructor(private xpWsSocket: XpWebSocketService, 
              private alertCtrl: AlertController,
              private utils: UtilsService,
              private mapService: MapService) {

    if ( PauseForMePage.reloj == 1 ) {
      PauseForMePage.reloj = 2;
    } else {
      PauseForMePage.reloj = 1;
    }
    this.timeImg = "time" + PauseForMePage.reloj + ".png";

    if ( this.xpWsSocket.getLastMessageReceive() ) {
      var json = JSON.parse(this.xpWsSocket.getLastMessageReceive());
      if ( json && json.airplane && json.airplane.pauseforme ) {
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
    }

    this.subscription = this.xpWsSocket.messageStream().subscribe (
        json => {
          var json = JSON.parse(json);
          if ( json.airplane ) {
            this.currentAltitude    = json.airplane.currentAltitude;
            this.currentAirspeed    = json.airplane.airspeed;
            this.currentAirportDist = json.airplane.pauseforme.navaid.config.distance.airport;
            this.currentVorDist     = json.airplane.pauseforme.navaid.config.distance.vor;
            this.currentFixDist     = json.airplane.pauseforme.navaid.config.distance.fix;
            this.currentNdbDist     = json.airplane.pauseforme.navaid.config.distance.ndb;
            this.currentDmeDist     = json.airplane.pauseforme.navaid.config.distance.dme;
            this.currentTime        = this.utils.formatCurrentTime(json.airplane.time);

            this.airportSelected = json.airplane.pauseforme.navaid.config.selected.airport == 1 ? true : false;
            this.vorSelected     = json.airplane.pauseforme.navaid.config.selected.vor == 1 ? true : false;
            this.ndbSelected     = json.airplane.pauseforme.navaid.config.selected.ndb == 1 ? true : false;
            this.fixSelected     = json.airplane.pauseforme.navaid.config.selected.fix == 1 ? true : false;
            this.dmeSelected     = json.airplane.pauseforme.navaid.config.selected.dme == 1 ? true : false;

            this.altitudeSelected = json.airplane.pauseforme.altitude.selected == 1 ? true : false;
            this.airspeedSelected = json.airplane.pauseforme.speed.selected    == 1 ? true : false;

            this.timeSelected = json.airplane.pauseforme.timePauseSelected == 1 ? true : false;

            console.log("| etaPauseByNavaIdAirport: " + this.mapService.etaPauseByNavaIdAirport);
            console.log("| etaPauseByNavaIdVor: " + this.mapService.etaPauseByNavaIdVor);
            console.log("| etaPauseByNavaIdNdb: " + this.mapService.etaPauseByNavaIdNdb);
            console.log("| etaPauseByNavaIdFix: " + this.mapService.etaPauseByNavaIdFix);
            console.log("| etaPauseByNavaIdDme: " + this.mapService.etaPauseByNavaIdDme);
            console.log("* etaPauseByTime: " + this.mapService.etaPauseByTime);
            console.log("--------------------------------");
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
