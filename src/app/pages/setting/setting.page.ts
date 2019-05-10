import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service' 
import { UtilsService } from '../../services/utils.service';
import { AirplaneService } from '../../services/airplane.service';
import { Airplane } from '../../services/airplane';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage  {

  xplaneAddress: string = "localhost";
  xplanePort: string    = "9002";
  deviceName: string    = "UALTER Desktop";
  airplane: Airplane;
  airplaneId: string;

  constructor(
    public navCtrl: NavController, 
    public dataService: DataService, 
    public airplaneService: AirplaneService,
    public utils: UtilsService) {

    this.dataService.currentSettings.subscribe(settings => {
      this.xplaneAddress   = settings.xplaneAddress;
      this.xplanePort      = settings.xplanePort;
      this.deviceName      = settings.name; 
      this.airplane        = this.airplaneService.getAirplane(settings.airplaneId);
      if ( this.airplane ) {
          this.airplaneId = this.airplane.id;
      }
    });

    if ( !this.airplane ) {
      this.airplane = this.airplaneService.getAirplane("a320");
    }
  }

  ngOnInit() {
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {
    this.airplane = this.airplaneService.getAirplane(this.dataService.settings.airplaneId);
  }

  saveSettings() {
    var notify: boolean = false;

    if ( this.xplaneAddress != this.dataService.settings.xplaneAddress ) {
      this.dataService.changeSettingsXplaneAddress(this.xplaneAddress);
      notify = true;
    }
    if ( this.xplanePort != this.dataService.settings.xplanePort ) {
      this.dataService.changeSettingsXplanePort(this.xplanePort);
      notify = true;
    }
    if ( this.deviceName != this.dataService.settings.name ) {
      this.dataService.changeSettingsName(this.deviceName);
      notify = true;
    }

    if ( this.airplaneId != this.dataService.settings.airplaneId ) {
      notify = true;
    }
    
    if (notify) {
      this.dataService.saveSettings();
      this.dataService.notifyChangeSettingsToSubscribers();
    }
  }

  openAirplanesPage() {
    this.navCtrl.navigateForward('/airplane');
  }

  onFocusLostEvent(event) {
    let input = event['target'] as HTMLElement;

    if ( input.id == "inputXplaneAddress" ) {
      if ( this.xplaneAddress != this.dataService.settings.xplaneAddress ) {
          this.dataService.changeSettingsXplaneAddress(this.xplaneAddress);
          this.dataService.saveSettings();
          this.dataService.notifyChangeSettingsToSubscribers();
      }
    } else
    if ( input.id == "inputXplanePort" ) {
      if ( this.xplanePort != this.dataService.settings.xplanePort ) {
          this.dataService.changeSettingsXplanePort(this.xplanePort);
          this.dataService.saveSettings();
          this.dataService.notifyChangeSettingsToSubscribers();
      }
    } else
    if ( input.id == "inputDeviceName" ) {
      if ( this.deviceName != this.dataService.settings.name ) {
          this.dataService.changeSettingsName(this.deviceName);
          this.dataService.saveSettings();
          this.dataService.notifyChangeSettingsToSubscribers();
      }
    }
    
  }
  
}
