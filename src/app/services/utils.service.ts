import { Injectable } from '@angular/core';
import { Airplane } from './airplane';

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  OFF
}

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
    PATH_IMG_AIRPLANES: string = Airplane.pathImg();
    level: LogLevel = LogLevel.DEBUG;

    monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    shortMonthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];

    constructor() {
    }

    pad(num, size) {
        return ('000000000' + num).substr(-size); 
    }

    /**
     * Return if the Application is running under
     * a Browser (Desktop) or an App (iOS, Android)
     * (No practical and native solution found so far.)
     * This is a workaround! (Shoud be tested already, through many situations!)
     */
    isAppPlatform() {
        return (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));
    }

    formatDateToday() {
        return this.formatDate(new Date());
    }

    formattedHour() {
        let dt  = new Date();
        let hor = ("0" + dt.getHours()).slice(-2);
        let min = ("0" + dt.getMinutes()).slice(-2);
        let sec = ("0" + dt.getSeconds()).slice(-2);
        return hor + ":" +  min + ":" +  sec;
    }

    formatDate(_date) {
        var day        = _date.getDate();
        var monthIndex = _date.getMonth();
        var year       = _date.getFullYear();
        return year + "/" + this.shortMonthNames[monthIndex] + "/" + day;
    }

    formatNumber(number) {
        return parseInt(number).toString().replace(/\d(?=(\d{3})+$)/g,'$&,');
    }
      

    isJsonMessage(_message) {
        if (/^[\],:{}\s]*$/.test(_message.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          return true;
        }
        return false;
    }

    private writeLog(msg, logLevel: LogLevel, _object?: object) {
        var logMsg = "[" + 
                     LogLevel[logLevel] + 
                     "] " + 
                     this.formatDateToday() + 
                     ": " + 
                     msg;
        if ( _object != undefined ) {
            logMsg += " ...(cont. next line)..."
        }
        console.log(logMsg);
        if ( _object != undefined ) {
            console.log(_object);
        }
    }

    trace(msg, _object?: object) {
        if ( this.level == LogLevel.TRACE ) {
            this.writeLog(msg, LogLevel.TRACE, _object);
        }
    }

    debug(msg, _object?: object) {
        if ( this.level <= LogLevel.DEBUG ) {
            this.writeLog(msg, LogLevel.DEBUG, _object);
        }
    }

    info(msg, _object?: object) {
        if ( this.level <= LogLevel.INFO ) {
            this.writeLog(msg, LogLevel.INFO, _object);
        }
    }
    

    warn(msg, _object?: object) {
        if ( this.level <= LogLevel.WARN ) {
            this.writeLog(msg, LogLevel.WARN, _object);
        }
    }

    error(msg, _object?: object) {
        if ( this.level >= LogLevel.ERROR ) {
            this.writeLog(msg, LogLevel.ERROR, _object);
        }
    }

}

