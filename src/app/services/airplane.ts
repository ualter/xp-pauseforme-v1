import { Airliner, AirplaneCategorySize } from "./airplane.service";

const PATH_IMG_AIRPLANES: string = "assets/imgs/airplanes/";

export class Airplane {

    airliner: Airliner;
    categorySize: AirplaneCategorySize;
    icon: string;
    icon_shadow: string;
    name: string;
    id: string;

    constructor(_id : string) {
        this.id = _id;
    }

    static pathImg() {
        return PATH_IMG_AIRPLANES;
    }



}