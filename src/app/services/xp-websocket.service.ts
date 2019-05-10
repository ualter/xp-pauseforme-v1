import { Injectable } from '@angular/core';
import {Observable, Observer, Subject, observable} from 'rxjs';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class XpWebSocketService {

  private subject: Subject<MessageEvent>;
  private ws : any;
  private lastMessageReceived: any;
  private streamObservables: Map<number,Observable<any>>;
  
  constructor(private utils: UtilsService) { 
  }

  public connect(url: string) {
    this.subject = this.create(url);
    return this.subject;
  }

  private create(url): Subject<MessageEvent> {
    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      console.log(error);
    }

    let observable = Observable.create( 
      (obs : Observer<MessageEvent>) =>  {
         this.ws.onmessage = obs.next.bind(obs);
         this.ws.onerror = obs.error.bind(obs);
         this.ws.onclose = obs.complete.bind(obs);
         return this.ws.close.bind(this.ws);
      }
    );

    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        } else {
          this.utils.info("WS readyState ==" + this.ws.readyState);
        }
      },
      error: (data: Object) => {
        this.utils.error("ERROR..:" + data);
        return this.ws.error;
      },
      complete: (data: Object) => {
        this.utils.info("CLOSED..:" + data);
      }
    }
    return Subject.create(observer, observable);
  }

  public setLastMessageReceive(msg: any) {
    this.lastMessageReceived = msg;
  }
  public getLastMessageReceive(){
    return this.lastMessageReceived;
  }

  public observable() {
    return this.subject;
  }

  public messageStream() : Observable<any> {
    return new Observable( observer => {
      setInterval( () => {
          if ( this.getLastMessageReceive() ) {
            observer.next( this.getLastMessageReceive() );
          } else {
            observer.error(" Not available! ");
          }
      }, 1000);
    });
  }

  public getWebSocket() {
    return this.ws;
  }

  public disconnect() {
    if ( this.ws ) {
      this.utils.info("Closing connection...");
      this.ws.close();
      this.ws = null;
    }
  }
}
