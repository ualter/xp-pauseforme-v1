import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import * as $ from "jquery";
import leaflet from 'leaflet';
import { AviationService } from '../../services/aviation.service';
import { DataService } from '../../services/data.service';
import { UtilsService } from '../../services/utils.service';
import { XpWebSocketService } from '../../services/xp-websocket.service';
import { RouterService } from '../../services/router.service';
import { FlightPlanService } from '../../services/flight-plan.service';
import { AirplaneService, AirplaneCategorySize } from '../../services/airplane.service';

const MAX_ZOOM          = 15;
const ZOOM_PAN_OPTIONS  = {animate: true, duration: 0.25, easeLinearity: 1.0, noMoveStart: false}; 
                        /*{animate: true, duration: 3.5, easeLinearity: 1.0, noMoveStart: false}*/

//const WS_CONNECTING = 0;
const WS_OPEN       = 1;
//const WS_CLOSING    = 2;
const WS_CLOSED     = 3;

var mbAttr         = '&copy;<a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
var mbUrl          = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
var grayscaleTile  = leaflet.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr});
var streetsTile    = leaflet.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr});
var standardTile   = leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attributions: mbAttr, maxZoom: MAX_ZOOM});    
var terrainTile    = leaflet.tileLayer('http://c.tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {attributions: mbAttr, maxZoom: MAX_ZOOM});    
var darkMatterTile = leaflet.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {attributions: mbAttr, maxZoom: MAX_ZOOM});
var imaginaryTile  = leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attributions: mbAttr, maxZoom: MAX_ZOOM});   
var baseLayers = {
  "Grayscale": grayscaleTile,
  "Streets":   streetsTile,
  "Terrain":   terrainTile,
  "Dark":      darkMatterTile,
  "Imaginary": imaginaryTile,
  "Default":   standardTile
};

const RETRIES_ATTEMPTING_CONNECT = 5;
const DEFAULT_LONGITUDE          = 41.5497;
const DEFAULT_LATITUDE           = 2.0989;
const enum HEADING_OPTION {
  CALCULATED = 0,
  X_PLANE = 1
}

var SELECTED_HEADING_OPTION = HEADING_OPTION.X_PLANE;
var fadeInOut = 500;
var wsURL     = "ws://localhost:9002/";
var map;            
var latitude;
var longitude;
var userLatitude;
var userLongitude;
var userMarker;
var lastLat;
var lastLng;     
var lastBearing;
var airplaneMarker;
var airplanePopup;    
var followAirplane;
var gamePaused;
var buttonPlayPause;
var buttonFollowAirplane;
//var buttonGoToLocation;
//var buttonDisconnect;
var identificationName;
var staticXPlaneWsServer;
var staticAlertController;
var attempingConnectTimes = 0;
var toastPresented;
var threadAttemptToConnect;
var lastAirplaneData;

enum State {
  DISCONNECTED = 0,
  CONNECTED = 1,
  PAUSED = 2,
}

const DEFAULT_AIRPLANE_ICON_WIDTH  = 62;
const DEFAULT_AIRPLANE_ICON_HEIGHT = 59;
var   AIRPLANE_ICON_WIDTH          = DEFAULT_AIRPLANE_ICON_WIDTH;
var   AIRPLANE_ICON_HEIGHT         = DEFAULT_AIRPLANE_ICON_HEIGHT;
const AIRPLANE_ICON_ANCHOR_WIDTH   = AIRPLANE_ICON_WIDTH / 2;
const AIRPLANE_ICON_ANCHOR_HEIGHT  = AIRPLANE_ICON_HEIGHT - (AIRPLANE_ICON_HEIGHT - ((AIRPLANE_ICON_HEIGHT*60)/100));

var AIRPLANE_ICON = leaflet.icon({
  iconUrl:      'assets/imgs/airplane-a320.png',
  shadowUrl:    'assets/imgs/airplane-a320-shadow-0.png',
  iconSize:     [AIRPLANE_ICON_WIDTH, AIRPLANE_ICON_HEIGHT],
  shadowSize:   [AIRPLANE_ICON_WIDTH, AIRPLANE_ICON_HEIGHT],
  iconAnchor:   [AIRPLANE_ICON_ANCHOR_WIDTH, AIRPLANE_ICON_ANCHOR_HEIGHT],      // point of the icon which will correspond to marker's location
  shadowAnchor: [AIRPLANE_ICON_ANCHOR_WIDTH-5, AIRPLANE_ICON_ANCHOR_HEIGHT-4],  // the same for the shadow
  popupAnchor:  [0, (AIRPLANE_ICON_HEIGHT/2) * -1]                                                          // point from which the popup should open relative to the iconAnchor
});


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  animations: [
    trigger('visibilityMessageBar', [
      state('shown', style({ opacity: 0.9 })),
      state('hidden', style({ opacity: 0 })),
      transition('* => *', animate(fadeInOut))
    ]),
    trigger('colorChanged', [
      state('blue', style({ 'background-color': 'blue' })),
      state('red', style({ 'background-color': 'red' })),
      state('paused', style({ 'background-color': '#141c26' })),
      transition('* => *', animate('5ms'))
    ]),
    trigger('visibilityButtonConnectMe', [
      state('shown', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('* => *', animate(fadeInOut))
    ]),
    trigger('visibilityContacting', [
      state('shown', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('* => *', animate(fadeInOut))
    ]),
    trigger('visibilityWaiting', [
      state('shown', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('* => *', animate(fadeInOut))
    ])
  ]
})
export class MapPage implements OnInit {

  @ViewChild('map') mapContainer: ElementRef;
  subscription = null;
  
  visibilityMessageBar:      string = '';
  visibilityButtonConnectMe: string = '';
  visibilityContacting:      string = 'hidden';
  visibilityWaiting:         string = 'hidden';          

  messageBarIcon:       string = 'thunderstorm';
  messageBarText:       string = "Disconnected";
  messageBarColorIcon:  string = "";
  messageBarColor:      string = "red";
  
  private isConnectedWithXPlane:boolean = false;
  private connectionState:number = State.DISCONNECTED;

  // tslint:disable-next-line
  private connectMeDisable:boolean = false;
  private connectMeState:boolean = false;
  private xplaneAddress: string;
  private xplanePort: string;

  private static myself:MapPage;

  constructor(
    public dataService: DataService,
    public airplaneServices: AirplaneService,
    public navCtrl: NavController, 
    public geolocation: Geolocation,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public xpWsSocket: XpWebSocketService, 
    public utils: UtilsService,
    public aviation: AviationService,
    public router: RouterService,
    public flightPlan: FlightPlanService) {

      staticXPlaneWsServer  = xpWsSocket;
      staticAlertController = alertCtrl;
      MapPage.myself = this;

      this.dataService.currentSettings.subscribe(settings => {
        this.xplaneAddress = settings.xplaneAddress;
        this.xplanePort    = settings.xplanePort;
        identificationName = settings.name; 
  
        if ( this.xplanePort ) {
          wsURL = "ws://" + this.xplaneAddress + ":" + this.xplanePort + "/";
        } else {
          wsURL = "ws://" + this.xplaneAddress + "/";
        }
  
        let airplane = this.airplaneServices.getAirplane(settings.airplaneId);
        // Change size of icon accordingly with the Category Size of the Airplane
        if ( airplane.categorySize == AirplaneCategorySize.BIGGER ) {
             AIRPLANE_ICON_WIDTH  = DEFAULT_AIRPLANE_ICON_HEIGHT + 30;
             AIRPLANE_ICON_HEIGHT = DEFAULT_AIRPLANE_ICON_HEIGHT + 30;
        } else
        if ( airplane.categorySize == AirplaneCategorySize.BIG ) {
              AIRPLANE_ICON_WIDTH  = DEFAULT_AIRPLANE_ICON_HEIGHT + 15;
              AIRPLANE_ICON_HEIGHT = DEFAULT_AIRPLANE_ICON_HEIGHT + 15;
        } else
        if ( airplane.categorySize == AirplaneCategorySize.MEDIUM_JETS ) {
              AIRPLANE_ICON_WIDTH  = DEFAULT_AIRPLANE_ICON_HEIGHT + 5;
              AIRPLANE_ICON_HEIGHT = DEFAULT_AIRPLANE_ICON_HEIGHT + 5;      
        } else {
             AIRPLANE_ICON_WIDTH  = DEFAULT_AIRPLANE_ICON_HEIGHT;
             AIRPLANE_ICON_HEIGHT = DEFAULT_AIRPLANE_ICON_HEIGHT;
        }
        AIRPLANE_ICON.options.iconUrl   = airplane.icon;
        AIRPLANE_ICON.options.shadowUrl = airplane.icon_shadow;
        if ( airplaneMarker )  {
             airplaneMarker.setIcon(AIRPLANE_ICON);
             this.checkZoomLevelChangesOnMap(true);
        }
      });
  }

  ngOnInit() {
    this.loadMap();
    this.getSetUserPosition();
  }

  ngAfterViewInit(){
    $(document).ready(function(){
      //console.log('JQuery is working!!');
    });
    setTimeout(function () {
      map.invalidateSize(ZOOM_PAN_OPTIONS);
    }, 0);
  }

  ionViewDidEnter() {
    map.invalidateSize(ZOOM_PAN_OPTIONS);
  }

  onMessageReceived(payload) {
    var origin  = payload.origin;
    var message = payload.data;

    // Connection is still OPEN
    if ( this.xpWsSocket.getWebSocket() && this.xpWsSocket.getWebSocket().readyState == WS_OPEN ) {
        // Check Previous Connection State
        // If were DISCONNECTED before, then now should be prepared in CONNECTED mode
        if ( !this.isConnectedWithXPlane && this.connectMeState ) {
          this.changeStateToConnected();

          // Load last saved flightPlan
          if (this.dataService.settings.flightPlan) {
            this.updateFlightPlan(this.dataService.settings.flightPlan);
          }
        }

        if ( this.utils.isJsonMessage(message) ) {
            var json = JSON.parse(message);
            this.utils.trace("JSON received: ",json);

            // Check if it is a airplane update communication
            if ( message.indexOf('airplane') >= 0 ) {
              this.onMessageAirplane(json);
            }
            else if ( message.indexOf('message') >= 0 ) {
              this.onMessageCommand(json);
            }
            else if ( message.indexOf('flightPlan') >= 0 ) {
              this.onMessageFlightPlan(json);
            } else {
              this.utils.trace("Message not processed: ",message);
            }
        } else {
            this.utils.warn("Received JSON message it is NOT OK..: \"" + message + "\" from " + origin);
        }
    }
  }

  showToastPauseReason(json) {
    if ( this.connectionState != State.PAUSED ) {
        let msgs = json.message.split(",");
        let msg;
        if ( msgs.length > 1 ) {
          msg = msgs[1];
          msg = msg.replace(new RegExp("/","g")," / ");
          msg = "[ Paused at " + this.utils.formattedHour() + " ] Reason ►► " + msg;
        } else {
          msg = "[ Paused at " + this.utils.formattedHour() + " ] Reason ►► " + json.message + " by X-Plane";
        }
        this.presentTost({
            header:"Header",
            message: msg,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'OK',
            mode: "md",
            animated: "true",
            keyboardClose: "true",
            translucent: "true"
        });
    }
  }
  async presentTost(toastMessage) {
    const toast = await this.toastCtrl.create(toastMessage);
    toast.present();
  }
  dismissToastPauseReason() {
    if ( toastPresented ) {
      toastPresented.dismiss();
      toastPresented = null;
    }
  }

  onMessageCommand(json) {
    var event;
    this.utils.trace("onMessageCommand: " + json.message);
    if ( json.message.startsWith("PAUSED") ) {
      event = new Event('PAUSED');
      buttonPlayPause.dispatchEvent(event);
      this.showToastPauseReason(json);
      this.changeStateToPaused();
    } else
    if ( json.message == "PLAY" ) {
      event = new Event('PLAY');
      buttonPlayPause.dispatchEvent(event);
      this.changeStateToUnpaused();
      this.dismissToastPauseReason();
    } else
    if ( json.message == "STOPPED" ) {
      event = new Event('STOPPED');
      buttonPlayPause.dispatchEvent(event);
      this.disconnect();
    }
  }

  onMessageFlightPlan(json) {
    // save the FlightPlan locally
    this.dataService.changeFlightPlan(json.flightPlan);
    this.dataService.saveSettings();
    // Update it at screen
    this.updateFlightPlan(json.flightPlan);
  }

  onMessageAirplane(json) {
    // Bearing the Airplane new given Lat/Lng according with the last Lat/Lng
    let bearing = undefined;
    if ( /* SELECTED_HEADING_OPTION == HEADING_OPTION.CALCULATED && */ 
      (lastLat && lastLng) && (lastLat != json.airplane.lat || lastLng != json.airplane.lng) ) {
      bearing = this.aviation.bearing(json.airplane.lng,json.airplane.lat,lastLng,lastLat);
    } 
    // Reposition the Airplane new give Lat/Lng
    this.updateAirplanePosition(json.airplane, bearing);
    lastLat          = json.airplane.lat;
    lastLng          = json.airplane.lng;
    lastAirplaneData = json.airplane; 

    this.flightPlan.updateAirplaneData(lastAirplaneData);
  }
  
  updateFlightPlan(flightPlan) {
    this.flightPlan.showFlightPlan(flightPlan, lastAirplaneData);
  }
  updateAirplanePosition(airplaneData, bearing) {
    this.utils.trace("Airplane new position (Lat/Lng): " + airplaneData.lat + ":" + airplaneData.lng);

    var _lat = airplaneData.lat;
    if ( isNaN(parseFloat(_lat)) ) {
      _lat = 0;
    }
    var _lng = airplaneData.lng;
    if ( isNaN(parseFloat(_lng)) ) {
      _lng = 0;
    }

    var newLatLng = new leaflet.LatLng(_lat,_lng);
    if (!airplaneMarker) {
      this.createAirplaneMarker(_lat,_lng);
    }
    airplaneMarker.setLatLng(newLatLng);
    airplanePopup.setLatLng(newLatLng);
    let htmlPopup = this.airplaneHtmlPopup(airplaneData);
    airplaneMarker.setPopupContent(htmlPopup);

    // Draw next destination marker (if exists)
    //this.router.createUpdateNextDestinationMarker(airplaneData);

    // Rotate the Icon according with the bearing
    // Two options to rotate the Icon in Degrees according to the Heading of the Airplane
    // 1) bearing (calculated here with a Javascript function, using as parameters the last and current latitude and longitude coordinates.)
    // 2) airplaneData.heading (the information received of the X-Plane, just as it is, any calculation involved.)
    if ( SELECTED_HEADING_OPTION == HEADING_OPTION.CALCULATED ) {
      if ( bearing ) {
          // Adapt the rotation directon for the current icon used
          bearing = this.adaptAngleForIcon(bearing);
          lastBearing = bearing;
      }
    } else 
    if ( SELECTED_HEADING_OPTION == HEADING_OPTION.X_PLANE ) {
        lastBearing = airplaneData.heading;
    }

    if ( followAirplane ) {
      map.panTo(newLatLng);
    }

    latitude  = _lat;
    longitude = _lng;
  }

  adaptAngleForIcon(angle) {
    // Adapt the rotation directon for the current icon used
    if ( angle >= 0 && angle <= 180 ) {
      angle += 180;
    } else {
      angle -= 180;
    }
    if (angle < 0) {
      angle = 360 - (angle * -1);
    }
    return angle;
  }

  static rotateMarker(_bearing) {
    if ( airplaneMarker ) {
      _bearing = parseInt(_bearing);
      // Remove the last rotate info
      var oldBearingCss = (airplaneMarker._icon.style.transform).replace( new RegExp("rotate\\(.*deg\\)","gm"), "");
      // Add the new rotate info
      var newBearingCss = oldBearingCss + ' rotate(' + _bearing +  'deg)';                
      // Icon Airplane
      airplaneMarker._icon.style.transform         = newBearingCss;
      airplaneMarker._icon.style.transformOrigin   = "center center 0px";
      // Icon Shadown Airplane
      airplaneMarker._shadow.style.transform       = newBearingCss;
      airplaneMarker._shadow.style.transformOrigin = "center center 0px";
    }
  }


  createAirplaneMarker(_latitude, _longitude) {
    if ( isNaN(parseFloat(_latitude)) ) {
      _latitude = 0;
    }
    if ( isNaN(parseFloat(_longitude)) ) {
      _longitude = 0;
    }

    this.utils.trace("Adding airplaned to " + _latitude + ":" + _longitude);
    airplaneMarker = leaflet.marker([_latitude, _latitude], {icon: AIRPLANE_ICON}).addTo(map);
    leaflet.DomUtil.addClass(airplaneMarker._icon,'aviationClass');
    airplanePopup = airplaneMarker.bindPopup("<b>Hello world!</b><br>I am an airplane.");
    airplanePopup.setLatLng([_latitude, _longitude]);

    // Observer for the subscription (see right below)
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutationRecord) {
          var oldValue = airplaneMarker._icon.style.transform
          var newValue = oldValue.replace( new RegExp("rotate\\(.*deg\\)","gm"), "");
          airplaneMarker._icon.style.transform   = newValue + " rotate(" + lastBearing + "deg)";
          airplaneMarker._shadow.style.transform = newValue + " rotate(" + lastBearing + "deg)";
      });    
    });
    // Subscription to observe the eventual style modification of the AirplaneMarker (by something other than me)
    airplaneMarker._icon.id = "airplaneMarker";
    var airplaneMarkerTarget = document.getElementById(airplaneMarker._icon.id);
    observer.observe(airplaneMarkerTarget, { attributes : true, attributeFilter : ['style'] });
  }

  getSetUserPosition() {
    this.geolocation.getCurrentPosition().then((resp) => {
      if (resp) {
        userLatitude  = resp.coords.latitude;
        userLongitude = resp.coords.longitude;
        this.utils.info("LatLng User Location: " + userLatitude + ":" + userLongitude);
        var latLng = leaflet.latLng(userLatitude, userLongitude);
        userMarker = leaflet.marker(latLng).addTo(map);
        map.flyTo({userLatitude:userLongitude}, MAX_ZOOM - 2, ZOOM_PAN_OPTIONS);
      }      
    }).catch((error) => {
       this.utils.error('Error getting location: ' + error.message);
    });

    // In case he/she moves, let's get the new localization
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {

      if ( data 
           && data.coords 
           && data.coords.latitude
           && data.coords.longitude
           && (data.coords.latitude != userLatitude || data.coords.longitude != userLongitude) ) {

        userLatitude  = data.coords.latitude;
        userLongitude = data.coords.longitude;

        if ( userMarker && !isNaN(parseFloat(userLatitude)) && !isNaN(parseFloat(userLongitude))) {
          var newLatLng = new leaflet.LatLng(userLatitude,userLongitude);
          userMarker.setLatLng(newLatLng);
        }
      }      
    });
  }

  loadMap() {
    map = leaflet.map("map", {
          layers: [standardTile], 
          minZoom: 3,
          maxZoom: MAX_ZOOM,
          zoomControl:false
        }
    ).setView([41.5497, 2.0989], MAX_ZOOM - 5);
    map.addControl(this.createGoToLocationButton());
    map.addControl(this.createFollowAirplaneButton());
    map.addControl(this.createPlayPauseButton());
    map.addControl(this.createDisconnectButton());
    leaflet.control.layers(baseLayers).addTo(map);

    map.on('zoomend', this.zoomListener);
    this.router.setMap(map);
    this.flightPlan.setMap(map, identificationName);

    map.on('click',(e: any) => {
      this.defineWayPointOnClick(e);
    });
  }

  defineWayPointOnClick(e: any) {
    //var choicePopUp = leaflet.popup();
    var containerBtn = leaflet.DomUtil.create('div');
    var btn2 = leaflet.DomUtil.create('button', '', containerBtn);
    btn2.setAttribute('type', 'button');
    btn2.innerHTML = 'ClickMe!';
    containerBtn.innerHTML = 'You are at:'+ e.latlng.toString() + '<br>';
    containerBtn.appendChild(btn2);

    leaflet.DomEvent.on(btn2,'click', () => {
      MapPage.sendMessageToXPlane("FJKDSL","YO");
    });

    /*choicePopUp
      .setLatLng(e.latlng)
      .setContent(containerBtn)
      .openOn(map);*/
  }

  zoomListener() {
    // Check changes that must be done according to the Zoom level (mainly icons size)
    MapPage.myself.checkZoomLevelChangesOnMap();

    if ( followAirplane && map && leaflet ) {
      try {
        if ( !isNaN(parseFloat(latitude)) &&  !isNaN(parseFloat(longitude)) ) {
          map.panTo(leaflet.latLng(latitude,longitude));
        }
      } catch (error) {
        MapPage.myself.utils.error(error);
      }
    }
  }

  /*
   * Check changes that must be done according to the Zoom level
   */
  checkZoomLevelChangesOnMap(updateAirplaneChanged?) {
    var size = [0, 0];
    var zoom = map.getZoom();
    if ( zoom == 18 ) {
    } else
    if ( zoom == 17 ) {
    } else
    if ( zoom == 16 ) {
    } else
    if ( zoom == 15 ) {
      size[0] = -20;
      size[1] = -20;
    } else
    if ( zoom == 14 ) {
      size[0] = -15;
      size[1] = -15;
    } else
    if ( zoom == 13 ) {
      size[0] = -13;
      size[1] = -13;
    } else
    if ( zoom == 12 ) {
    } else
    if ( zoom == 11 ) {
    } else
    if ( zoom == 10 ) {
      size[0] = 0.5;
      size[1] = 0.5;
    } else
    if ( zoom == 9 ) {
      size[0] = 3;
      size[1] = 3;
    } else
    if ( zoom == 8 ) {
      size[0] = 4;
      size[1] = 4;
    } else
    if ( zoom == 7 ) {
      size[0] = 6;
      size[1] = 6;
    } else
    if ( zoom == 6 ) {
      size[0] = 10;
      size[1] = 10;
    } else
    if ( zoom == 5 ) {
      size[0] = 12;
      size[1] = 12;
    } else
    if ( zoom == 4 ) {
      size[0] = 14;
      size[1] = 14;
    } else
    if ( zoom == 3 ) {
      size[0] = 16;
      size[1] = 16;
    }

    this.adaptAirplaneIconSizeToZoom(size);
    // Check in case this is NOT ONLY an update for Airplane (icon vs. zoom) also call the Adapt Zoom to Flight Plan
    if ( !updateAirplaneChanged ) {
       this.adaptFlightPlanToZoom(zoom); 
    }
  }

  adaptFlightPlanToZoom(zoom) {
    this.flightPlan.adaptFlightPlanToZoom(zoom);
  }

  adaptAirplaneIconSizeToZoom(size) {
     // Adapt the Airplane's Icon Size to the current Zoom Level
     AIRPLANE_ICON.options.iconSize[0]   = (AIRPLANE_ICON_WIDTH   - size[0]);
     AIRPLANE_ICON.options.iconSize[1]   = (AIRPLANE_ICON_HEIGHT  - size[1]);
     AIRPLANE_ICON.options.shadowSize[0] = (AIRPLANE_ICON_WIDTH   - size[0]);
     AIRPLANE_ICON.options.shadowSize[1] = (AIRPLANE_ICON_HEIGHT  - size[1]);

     var widthAnchor  = (AIRPLANE_ICON.options.iconSize[0] / 2);
     var heightAnchor = (AIRPLANE_ICON.options.iconSize[1] - ((AIRPLANE_ICON.options.iconSize[1] * 50)/100));
     AIRPLANE_ICON.options.iconAnchor[0]   = widthAnchor;
     AIRPLANE_ICON.options.iconAnchor[1]   = heightAnchor;
     AIRPLANE_ICON.options.shadowAnchor[0] = widthAnchor  - 5;
     AIRPLANE_ICON.options.shadowAnchor[1] = heightAnchor - 4;
     if ( airplaneMarker ) {
          airplaneMarker.setIcon(AIRPLANE_ICON);
          MapPage.rotateMarker(lastBearing);
     }
  }

  // Localization Button Control Creation for Leaflet maps
  createGoToLocationButton() {
    var locationButtonControl = leaflet.Control.extend({
      options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },
     
      onAdd: function (map) {
          var container = MapPage.createContainerButton();

          var icon = leaflet.DomUtil.create('i', 'fas fa-location-arrow fa-3x');
          icon.style.width  = '30px';
          icon.style.height = '30px';
          container.appendChild(icon);
          
          container.onclick = function(e: any) {
            // If FollowAirplane is ON, we turn it off
            followAirplane = false;
            buttonFollowAirplane.style.color = "rgba(47, 79, 79, 0.8)";

            container.style.color = "rgba(0, 0, 0, 0.8)";
            if ( isNaN(userLongitude) ) {
              MapPage.myself.utils.warn("User Longitude were NaN, set to " + DEFAULT_LONGITUDE);
              userLongitude = DEFAULT_LONGITUDE;
            }
            if ( isNaN(userLatitude) ) {
              MapPage.myself.utils.warn("Latitude were NaN, set to " + DEFAULT_LATITUDE);
              userLatitude = DEFAULT_LATITUDE;
            }
            map.flyTo({lon: userLongitude, lat: userLatitude}, MAX_ZOOM - 4, ZOOM_PAN_OPTIONS);
            container.style.color = "rgba(47, 79, 79, 0.8)";
            e.stopPropagation();
          }
          //buttonGoToLocation = container;
          return container;
      }
    });
    return new locationButtonControl();
  }

  createFollowAirplaneButton() {
    var followAirplaneButtonControl = leaflet.Control.extend({
      options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },
     
      onAdd: function (map) {
          var container = MapPage.createContainerButton();

          var icon = leaflet.DomUtil.create('i', 'fas fa-plane fa-3x');
          icon.style.width     = '40px';
          icon.style.height    = '40px';
          icon.style.margin    = "-8px 0px 0px 5px";
          icon.style.transform = 'rotate(315deg)';
          container.appendChild(icon);
          
          container.onclick = function(e: any) {
            followAirplane = !followAirplane;
            if ( followAirplane ) {
              container.style.color = "rgba(0, 0, 0, 0.8)";
              if ( isNaN(longitude) ) {
                MapPage.myself.utils.warn("Longitude were NaN, set to " + DEFAULT_LONGITUDE);
                longitude = DEFAULT_LONGITUDE;
              }
              if ( isNaN(latitude) ) {
                MapPage.myself.utils.warn("Latitude were NaN, set to " + DEFAULT_LATITUDE);
                latitude = DEFAULT_LATITUDE;
              }
              map.flyTo({lon: longitude, lat: latitude}, map.getZoom(), ZOOM_PAN_OPTIONS);
            } else {
              container.style.color = "rgba(47, 79, 79, 0.8)";
            }
            e.stopPropagation();
          }
          buttonFollowAirplane = container;
          return container;
      }
    });
    return new followAirplaneButtonControl();
  }

  createPlayPauseButton() {
    var playPauseButtonControl = leaflet.Control.extend({
      options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },
     
      onAdd: function (map) {
          var container = MapPage.createContainerButton();

          var iconPause = leaflet.DomUtil.create('i', 'fas fa-pause fa-3x');
          iconPause.style.width     = '40px';
          iconPause.style.height    = '40px';
          iconPause.style.margin    = "0px 0px 0px 3px";
          container.appendChild(iconPause);

          var iconPlay = leaflet.DomUtil.create('i', 'fas fa-play fa-3x');
          iconPlay.style.width     = '40px';
          iconPlay.style.height    = '40px';
          iconPlay.style.margin    = "0px 0px 0px 4px";
          
          container.onclick = function(e: any) {
            if ( MapPage.getWSState() == WS_OPEN ) {
              MapPage.myself.visibilityWaiting = "shown"; 
              gamePaused = !gamePaused;
              if ( gamePaused ) {
                if (container.contains(iconPause)) container.removeChild(iconPause);
                container.appendChild(iconPlay);
                container.style.color = "rgba(0, 0, 0, 0.8)";
              } else {
                container.appendChild(iconPause);
                if (container.contains(iconPlay)) container.removeChild(iconPlay);
                container.style.color = "rgba(47, 79, 79, 0.8)";
              }
            }
            MapPage.sendMessageToXPlane("{PAUSE}", identificationName);
            e.stopPropagation();
          }

          container.addEventListener("PAUSED", function(){
            if (container.contains(iconPause)) container.removeChild(iconPause);
            container.appendChild(iconPlay);
            container.style.color = "rgba(0, 0, 0, 0.8)";
            MapPage.myself.utils.info("X-Plane was PAUSED!");
          });
          container.addEventListener("PLAY", function(){
             container.appendChild(iconPause);
             if (container.contains(iconPlay)) container.removeChild(iconPlay);
             container.style.color = "rgba(47, 79, 79, 0.8)";
             MapPage.myself.utils.info("X-Plane is in PLAY mode now!");
          });

          buttonPlayPause = container;
          return container;
      }
    });
    return new playPauseButtonControl();
  }

  static async  presentAlert(msgAlert) {
    const alert = await staticAlertController.create(msgAlert);
    await alert.present(); 
  }

  createDisconnectButton() {
    var playPauseButtonControl = leaflet.Control.extend({
      options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },
     
      onAdd: function (map) {
          var container = MapPage.createContainerButton();

          var iconDisconnect = leaflet.DomUtil.create('i', 'fas fa-sign-out-alt fa-3x');
          iconDisconnect.style.width     = '40px';
          iconDisconnect.style.height    = '40px';
          iconDisconnect.style.margin    = "0px 0px 0px 2px";
          container.appendChild(iconDisconnect);

          container.onclick = function(e: any) {
            MapPage.presentAlert({
            header: 'Warning',
            subHeader: 'X-Plane Connection',
            mode:'ios',
            animated: 'true',
            translucent: ' true',
            message: `
              Are you sure want disconnect from X-Plane?
            `,
            buttons: [
              {
                text: 'Forget it',
                role: 'cancel',
                handler: () => {
                }
              },
              {
                text: 'Yes, go ahed!',
                handler: () => {
                  MapPage.myself.disconnect();
                }
              }
            ]
            });
            e.stopPropagation();
          }
          
          //buttonDisconnect = container;
          return container;
      }
    });
    return new playPauseButtonControl();
  }

  static sendMessageToXPlane(message, identity) {
    if ( !staticXPlaneWsServer                || 
         !staticXPlaneWsServer.getWebSocket() || 
          staticXPlaneWsServer.getWebSocket().readyState != WS_OPEN ) {
          MapPage.presentAlert({
            header: 'Warning',
            subHeader: 'X-Plane Connection',
            mode:'ios',
            animated: 'true',
            translucent: ' true',
            message: 'Not connected, contact X-Plane right now?',
            buttons: [
              {
                text: 'Forget it',
                role: 'cancel',
                handler: () => {
                }
              },
              {
                text: 'Connect Me Now',
                handler: (e: any) => {
                  MapPage.myself.switchConnectMeState();
                  //e.stopPropagation();
                }
              }
            ]
        });
    } else {
        let finalMessage = message + "," + identity;
        MapPage.myself.utils.info("Sent \"" + finalMessage + "\" message to X-Plane");
        staticXPlaneWsServer.getWebSocket().send(finalMessage);
    }
  }

  static getWSState() {
    if ( staticXPlaneWsServer && staticXPlaneWsServer.getWebSocket() ) {
      return staticXPlaneWsServer.getWebSocket().readyState;
    } else {
      return WS_CLOSED;
    }
  }

  static createContainerButton() {
    var container = leaflet.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = 'white';
    container.style.width           = '33px';
    container.style.height          = '33px';
    container.style.paddingTop      = "3px";
    container.style.paddingLeft     = "1px";
    container.style.fontSize        = "8px";
    container.style.margin          = "5px 0px 0px 5px";
    container.style.color           = "rgba(47, 79, 79, 0.8)";
    container.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    return container;
  }

  
  connect() {
    airplaneMarker = null;
    lastLat        = null;
    lastLng        = null;
    latitude       = null;
    longitude      = null;
    lastBearing    = null;

    attempingConnectTimes++;
    this.utils.info("[" + attempingConnectTimes + "] Attempting connect to X-Plane at " + wsURL);
    this.connectXPlane();
  }

  disconnect() {
    MapPage.sendMessageToXPlane("{CLOSE}", identificationName);
    this.subscription.complete();
    this.subscription.unsubscribe();
    this.switchConnectMeStateToOFF();
    this.changeStateToDisconnected();
    this.xpWsSocket.disconnect();
    this.connectMeDisable = false;
    attempingConnectTimes = 0;

    if (airplaneMarker) {
      this.utils.trace("Removed the AirplaneMarker");
      map.removeLayer(airplaneMarker);
    }
    airplaneMarker = null;
  }

  connectXPlane() {
    this.subscription = this.xpWsSocket.connect(wsURL).subscribe(
        payload => {
          // Receiving the X-Plane Message
          this.onMessageReceived(payload);
          // Dismiss the signal of attempt to connect with X-Plane
          this.hideContactingXPlaneImg();
        },
        error => {
          this.utils.error('Oops', error)
        }
    );
  }

  hideContactingXPlaneImg() {
    this.visibilityContacting = "hidden"; 
  }

  changeStateToConnected() {
    this.utils.info("CONNECTED to X-Plane through " + wsURL);
    clearInterval(threadAttemptToConnect);
    attempingConnectTimes            = 0;
    this.connectionState             = State.CONNECTED;
    this.isConnectedWithXPlane       = true;
    this.messageBarIcon              = "sunny";
    this.messageBarText              = "CONNECTED";
    this.messageBarColorIcon         = "secondary";
    this.messageBarColor             = "blue";
    setTimeout(() => {   
      this.visibilityMessageBar      = "hidden";
      this.visibilityButtonConnectMe = "hidden"; 
      this.visibilityContacting      = "hidden"; 
    },fadeInOut+500);
    setTimeout(() => {   
      this.connectMeDisable            = true;
      // Starting in following airplane mode
      followAirplane                   = true;
      buttonFollowAirplane.style.color = "rgba(0, 0, 0, 0.8)";
      map.flyTo({lon: longitude, lat: latitude}, map.getZoom(), ZOOM_PAN_OPTIONS);
    },fadeInOut+600);
    
  }

  changeStateToDisconnected() {
    this.utils.info("DISCONNECTED from X-Plane");
    this.connectionState        = State.DISCONNECTED;
    this.connectMeState         = false;
    this.isConnectedWithXPlane  = false;
    this.messageBarIcon         = "thunderstorm";
    this.messageBarText         = "DISCONNECTED";
    this.messageBarColorIcon    = "";
    this.connectMeDisable       = false;
    setTimeout(() => {  
      this.visibilityMessageBar        = "shown";
      this.visibilityButtonConnectMe   = "shown";
      this.messageBarColor             = "red";
      followAirplane                   = false;
      buttonFollowAirplane.style.color = "rgba(47, 79, 79, 0.8)";
    },fadeInOut+500);
  }

  changeStateToPaused() {
    this.utils.info("PAUSED with X-Plane");
    this.connectionState        = State.PAUSED;
    this.messageBarIcon         = "pause";
    this.messageBarText         = "PAUSED";
    this.messageBarColorIcon    = "";
    this.messageBarColor        = "blue";
    setTimeout(() => {  
      this.visibilityMessageBar   = "shown";
      this.messageBarColor        = "paused";
      this.visibilityWaiting      = "hidden"; 
    },fadeInOut+500);
  }

  changeStateToUnpaused() {
    this.utils.info("UNPAUSED with X-Plane through");
    this.connectionState        = State.CONNECTED;
    this.isConnectedWithXPlane  = true;
    this.messageBarIcon         = "play";
    this.messageBarText         = "UNPAUSED";
    this.messageBarColorIcon    = "secondary";
    this.messageBarColor        = "blue";
    setTimeout(() => {   
      this.visibilityMessageBar      = "hidden";
      this.visibilityButtonConnectMe = "hidden"; 
      this.visibilityContacting      = "hidden"; 
      this.visibilityWaiting         = "hidden"; 
    },fadeInOut+500);
  }
  
  updateConnectMeState(event) {
    this.utils.trace("Connect Me State change to:" + event);
    if (event == true) {
      this.visibilityContacting = "shown"; 
      this.connect();
      this.activateThreadConnection();
    } else {
      this.stopAttemptingToConnect();
    }
  }
  stopPropagate(event: any) {
    event.stopPropagation();
  }

  activateThreadConnection() {
    threadAttemptToConnect = setInterval(() => {
      if ( this.xpWsSocket && this.xpWsSocket.getWebSocket() &&
           this.xpWsSocket.getWebSocket().readyState == WS_OPEN ) {
        this.utils.info("Thread detecting CONNECTED state");
      } else {
        //var st = this.xpWsSocket.getWebSocket() ? this.xpWsSocket.getWebSocket().readyState : "null";
        this.utils.info("Thread detecting DISCONNECTED state");
        this.attempToConnect();
      }
    },2000);
  }

  attempToConnect() {
    if ( attempingConnectTimes > (RETRIES_ATTEMPTING_CONNECT-1) ) {
      clearInterval(threadAttemptToConnect);
      threadAttemptToConnect = null;
      let alert = staticAlertController.create({
      title: 'Warning',
      message: `
        <p > <b>` + attempingConnectTimes + `</b> attempts were already made to contact X-Plane. Let's see...<br><br><b>1)</b> 
        Did you check the address?<br>
        <b>IP</b>: <font color="blue"><b>` + this.xplaneAddress + `</b></font><br>
        <b>Port</b>: <font color="blue"><b>` + this.xplanePort + `</b></font><br><br>
        <b>2)</b> Are you sure the PauseForMe plugin Transmitter is started?</p>
      `,
      buttons: [
        {
          text: 'Forget it',
          role: 'cancel',
          handler: () => {
            this.stopAttemptingToConnect();
          }
        },
        {
          text: 'Keep trying',
          handler: (e: any) => {
            attempingConnectTimes = 0;
            this.connect();
            this.activateThreadConnection();
            e.stopPropagation();
          }
        }
      ]
      });
      alert.present();
    } else {
      this.connect();
    }
  }

  stopAttemptingToConnect() {
    clearInterval(threadAttemptToConnect);
    this.switchConnectMeStateToOFF();
    attempingConnectTimes = 0;
    this.utils.trace("Stop attemping to contact X-Plane");
    this.hideContactingXPlaneImg();
  }

  switchConnectMeStateToOFF() {
    this.connectMeState = false;
  }

  switchConnectMeState() {
    this.connectMeState = !this.connectMeState;
    this.updateConnectMeState(this.connectMeState);
  }

  airplaneHtmlPopup(airplaneData) {
    let paddingValue  = 3;
    let fontSizeLabel = 12;
    let fontSizeValue = 12;
    let fontSizeUnit  = 11;

    let nextDest;
    let distanceTime;
    // Check if there's a next destination programmed
    if ( airplaneData.nextDestination.fms.status != 0 || airplaneData.nextDestination.gps.name != "NOT FOUND" ) {
        if ( airplaneData.nextDestination.fms.status != 0 ) {
            nextDest     = airplaneData.nextDestination.fms;
            distanceTime = airplaneData.nextDestination.fms.fmsTime;
        } else 
        if ( airplaneData.nextDestination.gps.name != "NOT FOUND" ) {
            nextDest     = airplaneData.nextDestination.gps;
            distanceTime = airplaneData.nextDestination.gps.dmeDistance;
        }
    }
    let destinationCell = "";
    if (nextDest) {
      destinationCell = `
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Destination.....:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + nextDest.id + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">` + nextDest.type + `</span>
        </td>
      </tr>
      <tr>
      <td>
        <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Distance........:</span>
      </td>
      <td align="right" style="padding-right:` + paddingValue + `px;">
        <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + nextDest.distance + `</span>
      </td>
      <td>
      <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">nm</span>
      </td>
    </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">ETA.............:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + distanceTime + `</span>
        </td>
        <td>
        </td>
      </tr>
      `;
    }

   
    //let autopilotState = airplaneData.autopilot.on == 1 ? "ON" : "OFF";
    var html = `
      <span style="font-size:12px;"><b>AIRPLANE</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <hr>
      <table border=0 cellspacing=0 cellpadding=0 width="100%">
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Heading.........:</span>
        </td>
        <td align="right" width="40px" align="right"  style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + airplaneData.heading + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeValue +`px;">°</span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Altitude........:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + this.utils.formatNumber(airplaneData.currentAltitude2) + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">feet</span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Vertical Speed..:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + airplaneData.vsFpm + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">fpm</span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Airspeed........:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + airplaneData.airspeed + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">kts</span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Ground Speed....:</span>&nbsp;&nbsp;
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + airplaneData.groundspeed + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">kts</span>
        </td>
      </tr>
      `+ destinationCell + `
      </table>
      `;
      //<tr>
      //  <td>
      //    <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Autopilot.......:</span>
      //  </td>
      //  <td align="right" style="padding-right:` + paddingValue + `px;">
      //    <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + autopilotState + `</span>
      //  </td>
      //  <td>
      //  </td>
      //</tr>

      var container = leaflet.DomUtil.create('div');
      container.innerHTML = html;
      return container;
      //return html;
  }

  

  
}
