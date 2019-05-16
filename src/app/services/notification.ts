
export class notifications {
    notification: INotification[];
}

export interface INotification {
    index: number;
    alertTimeId: number;
    alertDistanceId: number;
    id: string;
    timeToPause: string;
    nmToPause: number;
    alertTimeSet: boolean;
    alertDistanceSet: boolean;
}

