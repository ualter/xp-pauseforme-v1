
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
    alertTimeSchedule: boolean;
    alertDistanceSchedule: boolean;
    alertTimeTriggered: boolean;
    alertDistanceTriggered: boolean;
}

// Alarm Set: 
// Means that was already register at device notification system 
// to be launched any seconds ahead

// Alarm Schedule: 
// Means that was programmed at the Notification Page for the user to be created (set)
// at the right moment (close NM to the Navaid or 00:00:00 min before arrived to it)

// Alarm Triggered:
// Means that the notification set was already triggered by the device notification system
// But the still not "CLICK" or "CLOSE" the notification