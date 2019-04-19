import { Injectable } from '@angular/core';
import { UtilsService } from "./utils.service";
import { Airplane } from './airplane';

export enum Airliner {
  AIRBUS   = "airbus",
  BOEING   = "boeing",
  GENERAL  = "general"
}

export enum AirplaneCategorySize {
  SMALL_PLANES,
  MEDIUM_JETS,
  BIG,
  BIGGER
}

@Injectable({
  providedIn: 'root'
})
export class AirplaneService {

  airplanes: Map<string,Airplane>;
    airliners: Map<string,string>;

    constructor(private utils: UtilsService) {

        this.airplanes = new Map<string,Airplane>();
        this.airliners = new Map<string,string>();

        this.loadAirliners();
        this.loadAirplanes();
    }

    private loadAirliners() {
        this.airliners.set(Airliner.AIRBUS, Airliner.AIRBUS);
        this.airliners.set(Airliner.BOEING, Airliner.BOEING);
        this.airliners.set(Airliner.GENERAL, Airliner.GENERAL);
    }

    private loadAirplanes() {
        this.createAirbusAirplanes();
        this.createBoeingAirplanes();
        this.createGeneralAirplanes();
    }

    keysAirliners() {
        return Array.from(this.airliners.keys());
    }

    listAirliners() {
        return Array.from(this.airliners.values());
    }

    keysAirplanes() {
        return Array.from(this.airplanes.keys());
    }

    listAirplanes(airliner) {
        return Array.from( this.airplanes.values() )
            .filter((airplane: Airplane) => {
                return airplane.airliner === airliner;
            });
    }

    getAirplane(id) {
        return this.airplanes.get(id);
    }

    listAllAirplanes() {
        return this.airplanes.values();
    }

    private createBoeingAirplanes() {
        let airplane;

        airplane                      = new Airplane("b737-800-qantas");
        airplane.name                 = "B737-800 Qantas";
        airplane.airliner             = Airliner.BOEING;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("b777-200");
        airplane.name                 = "B777-200";
        airplane.airliner             = Airliner.BOEING;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("b777-200-jpn");
        airplane.name                 = "B777-200 JPN";
        airplane.airliner             = Airliner.BOEING;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("b747-800-white");
        airplane.name                 = "B747-800 White";
        airplane.airliner             = Airliner.BOEING;
        airplane.categorySize         = AirplaneCategorySize.BIGGER;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("b747-400-united");
        airplane.name                 = "B747-400 United";
        airplane.airliner             = Airliner.BOEING;
        airplane.categorySize         = AirplaneCategorySize.BIGGER;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.BOEING + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);
    }

    private createGeneralAirplanes() {
        let airplane;

        airplane                      = new Airplane("cessna-147");
        airplane.name                 = "Cessna 147";
        airplane.airliner             = Airliner.GENERAL
        airplane.categorySize         = AirplaneCategorySize.SMALL_PLANES;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.GENERAL + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.GENERAL + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);
    }

    private createAirbusAirplanes() {
        let airplane;

        airplane                      = new Airplane("a310");
        airplane.name                 = "A310";
        airplane.airliner             = Airliner.AIRBUS;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("a320");
        airplane.name                 = "A320";
        airplane.airliner             = Airliner.AIRBUS;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("a330");
        airplane.name                 = "A330";
        airplane.airliner             = Airliner.AIRBUS;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("a340");
        airplane.name                 = "A340";
        airplane.airliner             = Airliner.AIRBUS;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("a350");
        airplane.name                 = "A350";
        airplane.airliner             = Airliner.AIRBUS;
        airplane.categorySize         = AirplaneCategorySize.BIG;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);

        airplane                      = new Airplane("a380");
        airplane.name                 = "A380";
        airplane.airliner             = Airliner.AIRBUS;
        airplane.categorySize         = AirplaneCategorySize.BIGGER;
        airplane.icon                 = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + ".png";
        airplane.icon_shadow          = this.utils.PATH_IMG_AIRPLANES + Airliner.AIRBUS + "/airplane-" + airplane.id + "-shadow.png";
        this.airplanes.set(airplane.id,airplane);
    }

}
