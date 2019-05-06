import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { settings, IFlightPlan } from './settings'
import { Storage } from '@ionic/storage';
import { UtilsService } from "./utils.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private settingsSource: BehaviorSubject<settings>;
    settings: settings;
    currentSettings: Observable<settings>

    constructor(private storage: Storage, private utils: UtilsService) {
        this.settings                    = new settings();
        this.settings.xplaneAddress      = '127.0.0.1';
        this.settings.xplanePort         = '9002';
        this.settings.name               = 'UALTER Desktop';
        this.settings.airplaneId         = 'a320';

        this.settingsSource = new BehaviorSubject<settings>(this.settings);
        this.currentSettings = this.settingsSource.asObservable();

        // Asynchronously check database if there is already an object saved before, 
        // if found... notify the subscribers again with the new value
        this.storage.get('settings').then((vlr) => {
            if (vlr) {
                this.utils.trace("Load settings data from LocalStorage:" + vlr);                
                this.settings = JSON.parse(vlr);
                this.settingsSource.next(this.settings);
            }
        });
    }

    changeSettingsXplaneAddress(xplaneAddress:string) {
        this.settings.xplaneAddress = xplaneAddress;
    }

    changeSettingsXplanePort(xplanePort:string) {
        this.settings.xplanePort = xplanePort;
    }

    changeSettingsName(name:string) {
        this.settings.name = name;
    }

    changeSettingsAirplane(airplaneId:string) {
        this.settings.airplaneId = airplaneId;
    }

    changeFlightPlan(flightPlan:IFlightPlan) {
        this.settings.flightPlan = flightPlan;
    }

    notifyChangeSettingsToSubscribers() {
        this.settingsSource.next(this.settings);
    }

    saveSettings() {
        this.storage.set('settings',JSON.stringify(this.settings));
    }
}
