import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { AirplaneService } from '../../services/airplane.service';
import { Airplane } from '../../services/Airplane';

@Component({
  selector: 'app-airplane',
  templateUrl: './airplane.page.html',
  styleUrls: ['./airplane.page.scss'],
})
export class AirplanePage  implements OnInit {

  airplane: Airplane;
  model: string         = "";
  airliner: string      = "";
  previousModel: string = "";

  constructor(
    public navCtrl: NavController, 
    public dataService: DataService,
    public airplaneServices: AirplaneService) {

      let saveChanges: boolean;
      if ( !this.dataService.settings.airplaneId ) {
        this.dataService.changeSettingsAirplane("a320");
        saveChanges = true;
      }
      this.airplane   = this.airplaneServices.getAirplane(this.dataService.settings.airplaneId);
      this.airliner   = this.airplane.airliner 
      this.model      = this.airplane.id;
      
      if ( saveChanges ) {
        this.dataService.saveSettings();
      }
  }

  ngOnInit(): void {
  }

  listAirliners() {
    return this.airplaneServices.listAirliners();
  }

  listAirplanes(filterAirliner) {
    return this.airplaneServices.listAirplanes(filterAirliner);
  }

  ionViewDidLoad() {
  }

  ionViewWillLeave() {
  }

  onChangeHandler(event) {
    var idAirplane = event.detail.value;
    if ( idAirplane != this.previousModel) {
      this.dataService.changeSettingsAirplane(idAirplane);
      this.previousModel = idAirplane;
    }
  }

}
