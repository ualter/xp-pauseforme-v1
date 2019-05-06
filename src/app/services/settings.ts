

export class settings {

    xplaneAddress: string;
    xplanePort: string;
    name: string;
    airplaneId: string;
    flightPlan: IFlightPlan;

}

export interface IFlightPlan {
    waypoints: IWaypoints[];
}

export interface IWaypoints {
    index: number;
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    type: string;
}