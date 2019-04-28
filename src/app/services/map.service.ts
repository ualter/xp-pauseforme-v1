import { UtilsService } from './utils.service';
import { Injectable } from '@angular/core';

const DISTANCE_NM = 1852.05;
const SPEED_KTS   = 0.514444444444;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private _etaPauseByTime: string;
  private _etaPauseByNavaIdAirport: string;
  private _etaPauseByNavaIdVor: string;
  private _etaPauseByNavaIdNdb: string;
  private _etaPauseByNavaIdFix: string;
  private _etaPauseByNavaIdDme: string;

  constructor(private utils: UtilsService) { }

  get etaPauseByTime() : string {
    return this._etaPauseByTime;
  }

  get etaPauseByNavaIdAirport() : string {
    return this._etaPauseByNavaIdAirport;
  }
  get etaPauseByNavaIdVor() : string {
    return this._etaPauseByNavaIdVor;
  }
  get etaPauseByNavaIdNdb() : string {
    return this._etaPauseByNavaIdNdb;
  }
  get etaPauseByNavaIdFix() : string {
    return this._etaPauseByNavaIdFix;
  }
  get etaPauseByNavaIdDme() : string {
    return this._etaPauseByNavaIdDme;
  }

  calculateETAPauseNavaIdAirport(airplaneGroundspeed, distanceAirport) : void   {
    let distance   = parseInt(distanceAirport);
    let etaSeconds = ((distance * DISTANCE_NM) / (airplaneGroundspeed * SPEED_KTS));
    this._etaPauseByNavaIdAirport = this.utils.mountTimeFromSeconds(etaSeconds);
  }
  calculateETAPauseNavaIdVor(airplaneGroundspeed, distanceVor) : void   {
    let distance   = parseInt(distanceVor);
    let etaSeconds = ((distance * DISTANCE_NM) / (airplaneGroundspeed * SPEED_KTS));
    this._etaPauseByNavaIdVor = this.utils.mountTimeFromSeconds(etaSeconds);
  }
  calculateETAPauseNavaIdFix(airplaneGroundspeed, distanceFix) : void   {
    let distance   = parseInt(distanceFix);
    let etaSeconds = ((distance * DISTANCE_NM) / (airplaneGroundspeed * SPEED_KTS));
    this._etaPauseByNavaIdFix = this.utils.mountTimeFromSeconds(etaSeconds);
  }
  calculateETAPauseNavaIdNdb	(airplaneGroundspeed, distanceNdb) : void   {
    let distance   = parseInt(distanceNdb);
    let etaSeconds = ((distance * DISTANCE_NM) / (airplaneGroundspeed * SPEED_KTS));
    this._etaPauseByNavaIdNdb = this.utils.mountTimeFromSeconds(etaSeconds);
  }
  calculateETAPauseNavaIdDme	(airplaneGroundspeed, distanceDme) : void   {
    let distance   = parseInt(distanceDme);
    let etaSeconds = ((distance * DISTANCE_NM) / (airplaneGroundspeed * SPEED_KTS));
    this._etaPauseByNavaIdDme = this.utils.mountTimeFromSeconds(etaSeconds);
  }

  calculateETAPauseTime(time, timePause) : void {
    this._etaPauseByTime = this.utils.diffHours(time, timePause);
  }

  resetETAPauseNavaIdAirport() {
    this._etaPauseByNavaIdAirport = null;
  }
  resetETAPauseNavaIdVor() {
    this._etaPauseByNavaIdVor = null;
  }
  resetETAPauseNavaIdNdb() {
    this._etaPauseByNavaIdNdb = null;
  }
  resetETAPauseNavaIdFix() {
    this._etaPauseByNavaIdFix = null;
  }
  resetETAPauseNavaIdDme() {
    this._etaPauseByNavaIdDme = null;
  }

  resetAllNavaids() {
    this.resetETAPauseNavaIdAirport();
    this.resetETAPauseNavaIdVor();
    this.resetETAPauseNavaIdFix();
    this.resetETAPauseNavaIdNdb();
    this.resetETAPauseNavaIdDme();
  }

  
}
