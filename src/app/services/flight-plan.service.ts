import { XpWebSocketService } from './xp-websocket.service';
import { Injectable } from "@angular/core";
import { UtilsService } from "./utils.service";
import { AviationService } from './aviation.service';
import leaflet from 'leaflet';
import { Subject } from 'rxjs'; 

var map;
var identification;
var flightPlanPaths = [];
var flightPlanMarkersAirportGroup1;
var flightPlanMarkersAirportGroup2;
var flightPlanMarkersSize1Group;
var flightPlanMarkersSize2Group;
var flightPlanMarkersSize3Group;
var flightPlanMarkersSize4Group;
var flightPlanMarkersSize5Group;


class IconSize1 {
  ICON_WIDTH         = 100;
  ICON_HEIGHT        = 50;
  ICON_ANCHOR_WIDTH  = this.ICON_WIDTH / 4;
  ICON_ANCHOR_HEIGHT = this.ICON_WIDTH / 2;

  NDB_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s1/icon_ndb.png',
    shadowUrl:    'assets/imgs/s1/icon_ndb_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],  // point of the icon which will correspond to marker's location
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],  // the same for the shadow
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]  // point from which the popup should open relative to the iconAnchor
  });
  VOR_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s1/icon_vor.png',
    shadowUrl:    'assets/imgs/s1/icon_vor_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  FIX_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s1/icon_fix.png',
    shadowUrl:    'assets/imgs/s1/icon_fix_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  LATLNG_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s1/icon_latlng.png',
    shadowUrl:    'assets/imgs/s1/icon_latlng_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  LOCATION_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s1/icon_location.png',
    shadowUrl:    'assets/imgs/s1/icon_location_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  AIRPORT_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s1/icon_airport.png',
    shadowUrl:    'assets/imgs/s1/icon_airport_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
}

class IconSize2 {
  ICON_WIDTH         = 80;
  ICON_HEIGHT        = 40;
  ICON_ANCHOR_WIDTH  = this.ICON_WIDTH / 4;
  ICON_ANCHOR_HEIGHT = this.ICON_WIDTH / 2;

  NDB_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s2/icon_ndb_s2.png',
    shadowUrl:    'assets/imgs/s2/icon_ndb_s2_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],  // point of the icon which will correspond to marker's location
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],  // the same for the shadow
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]  // point from which the popup should open relative to the iconAnchor
  });
  VOR_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s2/icon_vor_s2.png',
    shadowUrl:    'assets/imgs/s2/icon_vor_s2_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  FIX_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s2/icon_fix_s2.png',
    shadowUrl:    'assets/imgs/s2/icon_fix_s2_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  LATLNG_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s2/icon_latlng_s2.png',
    shadowUrl:    'assets/imgs/s2/icon_latlng_s2_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  LOCATION_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s2/icon_location_s2.png',
    shadowUrl:    'assets/imgs/s2/icon_location_s2_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
  AIRPORT_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/s2/icon_airport_s2.png',
    shadowUrl:    'assets/imgs/s2/icon_airport_s2_shadow.png',
    iconSize:     [this.ICON_WIDTH,this.ICON_HEIGHT],
    shadowSize:   [this.ICON_WIDTH,this.ICON_HEIGHT],
    iconAnchor:   [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    shadowAnchor: [this.ICON_ANCHOR_WIDTH,this.ICON_ANCHOR_HEIGHT],
    popupAnchor:  [0,((this.ICON_HEIGHT/2) + 23) * -1]
  });
}

var iconSize1 = new IconSize1();
var iconSize2 = new IconSize2();

var zoomIconSize1 = [10,18];
var zoomIconSize2 = [8,9];
var zoomIconSize3 = [7,7];
var zoomIconSize4 = [6,6];
var zoomIconSize5 = [5,5];

const WS_OPEN     = 1;

@Injectable({
  providedIn: 'root'
})
export class FlightPlanService {

  airplaneData;
  airplaneLastLat     = 9999;
  airplaneLastLng     = 9999;
  flightPlanWaypoints = [];
  flightPlanObservable;
  xpWsSocket: XpWebSocketService;

  constructor(public utils: UtilsService,
    public aviation: AviationService) {
      flightPlanMarkersAirportGroup1 = new leaflet.FeatureGroup();
      flightPlanMarkersAirportGroup2 = new leaflet.FeatureGroup();
      flightPlanMarkersSize1Group    = new leaflet.FeatureGroup();
      flightPlanMarkersSize2Group    = new leaflet.FeatureGroup();
      flightPlanMarkersSize3Group    = new leaflet.FeatureGroup();
      flightPlanMarkersSize4Group    = new leaflet.FeatureGroup();
      flightPlanMarkersSize5Group    = new leaflet.FeatureGroup();

      this.flightPlanObservable = new Subject<any>();
      this.flightPlanObservable.asObservable().subscribe(message => {
        this.createMarkerPopUps(message);
      });
}        

setMap(_map, _identification) {
    map = _map;
    identification = _identification;
}

setXpWsSocket(_xpWsSocket) {
  this.xpWsSocket = _xpWsSocket;
}

showFlightPlan(flightPlan, _airplaneData){
    this.utils.trace(flightPlan);
    if ( flightPlan  ) {
        this.airplaneData = _airplaneData;

        // clean previous if exists
        this.cleanPreviousFlightPlan();

        let previousLatLng = [];
        let pointList      = [];
        let marker;

        for (var index = 0; index < flightPlan.waypoints.length; ++index) {
            var wpt = flightPlan.waypoints[index];
            let flightPlanWaypoint = [];
            flightPlanWaypoint["navaid"] = wpt;
            pointList.push(new leaflet.LatLng(wpt.latitude,wpt.longitude));

            // Depart Airport
            if ( index == 0 ) {
              //let departLatLng = [];
              //departLatLng = [wpt.latitude, wpt.longitude, wpt.id];
              this.addAirportToGroups(wpt,true);
            } else
            // Arrival Airport
            if ( index == (flightPlan.waypoints.length - 1) ) {
              this.addAirportToGroups(wpt,false);
            } else {
              if ( previousLatLng.length > 0 ) {
                // In case debugging message
                // Calculating distances From Depart Airport and from Last Waypoint
                //let distanceFromPreviousWpt = Math.floor(this.aviation.distance(wpt.longitude, wpt.latitude, previousLatLng[1], previousLatLng[0]));
                //let distanceFromDepartWpt   = Math.floor(this.aviation.distance(wpt.longitude, wpt.latitude, departLatLng[1], departLatLng[0]));
                //var msg = previousLatLng[2] + " to " + wpt.id + " " + distanceFromPreviousWpt + " From Departing " + distanceFromDepartWpt;
              }

              // Marker Navaids
              marker = this.createNextDestinationMarker(wpt,iconSize1);
              flightPlanWaypoint["marker1"] = marker;
              flightPlanMarkersSize1Group.addLayer(marker);

              marker = this.createNextDestinationMarker(wpt,iconSize2);
              flightPlanWaypoint["marker2"] = marker;
              flightPlanMarkersSize2Group.addLayer(marker);

              marker = this.createNextDestinationCircle(wpt,7);
              flightPlanWaypoint["marker3"] = marker;
              flightPlanMarkersSize3Group.addLayer(marker);

              marker = this.createNextDestinationCircle(wpt,6);
              flightPlanWaypoint["marker4"] = marker;
              flightPlanMarkersSize4Group.addLayer(marker);

              marker = this.createNextDestinationCircle(wpt,5);
              flightPlanWaypoint["marker5"] = marker;
              flightPlanMarkersSize5Group.addLayer(marker);

              this.flightPlanWaypoints.push(flightPlanWaypoint);
            }

            // Vector FlightPlan
            if ( previousLatLng.length > 0  ) {
              var path  = new leaflet.polyline([[previousLatLng[0], previousLatLng[1]],[wpt.latitude, wpt.longitude]], {
                color: 'blue',
                weight: 4,
                opacity: 0.85,
                smoothFactor: 9
              });
              path.addTo(map);
              flightPlanPaths.push(path);
            }

            previousLatLng = [wpt.latitude, wpt.longitude, wpt.id];
        }

        if ( map.getZoom() >= zoomIconSize1[0] &&  map.getZoom() <= zoomIconSize1[1] )   {
          map.addLayer(flightPlanMarkersAirportGroup1);
          map.addLayer(flightPlanMarkersSize1Group);
        } else 
        if ( map.getZoom() >= zoomIconSize2[0] &&  map.getZoom() <= zoomIconSize2[1] )   {
          map.addLayer(flightPlanMarkersAirportGroup1);
          map.addLayer(flightPlanMarkersSize2Group);
        } else 
        if ( map.getZoom() >= zoomIconSize3[0] &&  map.getZoom() <= zoomIconSize3[1] )   {
          map.addLayer(flightPlanMarkersAirportGroup2);
          map.addLayer(flightPlanMarkersSize3Group);
        } else 
        if ( map.getZoom() >= zoomIconSize4[0] &&  map.getZoom() <= zoomIconSize4[1] )   {
          map.addLayer(flightPlanMarkersAirportGroup2);
          map.addLayer(flightPlanMarkersSize4Group);
        } else 
        if ( map.getZoom() >= zoomIconSize5[0] &&  map.getZoom() <= zoomIconSize5[1] )   {
          map.addLayer(flightPlanMarkersAirportGroup2);
          map.addLayer(flightPlanMarkersSize4Group);
        }

        this.flightPlanObservable.next(
          {
            event: "call",
            method: "showFlightPlan"
          }
        );
    }
}

private addAirportToGroups(wpt: any, departure: boolean) {
  let marker;  
  let flightPlanWaypoint       = [];
  flightPlanWaypoint["navaid"] = wpt;

  marker = this.createAirportMarker(wpt, iconSize1);
  flightPlanMarkersAirportGroup1.addLayer(marker);
  if (departure) {
    flightPlanWaypoint["departure1"] = marker;
  } else  {
    flightPlanWaypoint["arrival1"] = marker;
  }

  marker = this.createAirportMarker(wpt, iconSize2);
  flightPlanMarkersAirportGroup2.addLayer(marker);
  if (departure) {
    flightPlanWaypoint["departure2"] = marker;
  } else  {
    flightPlanWaypoint["arrival2"] = marker;
  }

  this.flightPlanWaypoints.push(flightPlanWaypoint);
}

cleanPreviousFlightPlan() {
  if (flightPlanPaths) {
     for (var path of flightPlanPaths) {
       map.removeLayer(path);
     }
  }
  flightPlanMarkersSize1Group.clearLayers();
  flightPlanMarkersSize2Group.clearLayers();
  flightPlanMarkersSize3Group.clearLayers();
  flightPlanMarkersSize4Group.clearLayers();
  flightPlanMarkersSize5Group.clearLayers();

  flightPlanMarkersAirportGroup1.clearLayers();
  flightPlanMarkersAirportGroup2.clearLayers();

  if ( flightPlanMarkersSize1Group ) {
    map.removeLayer(flightPlanMarkersSize1Group);
  }
  if ( flightPlanMarkersSize2Group ) {
    map.removeLayer(flightPlanMarkersSize2Group);
  }
  if ( flightPlanMarkersSize3Group ) {
    map.removeLayer(flightPlanMarkersSize3Group);
  }
  if ( flightPlanMarkersSize4Group ) {
    map.removeLayer(flightPlanMarkersSize4Group);
  }
  if ( flightPlanMarkersSize5Group ) {
    map.removeLayer(flightPlanMarkersSize5Group);
  }

  if ( flightPlanMarkersAirportGroup1 ) {
    map.removeLayer(flightPlanMarkersAirportGroup1);
  }
  if ( flightPlanMarkersAirportGroup2 ) {
    map.removeLayer(flightPlanMarkersAirportGroup2);
  }
}



updateAirplaneData(_airplaneData) {
  // The avirplane has moved?
  if ( (this.airplaneLastLat != _airplaneData.lat) || (this.airplaneLastLng != _airplaneData.lng) ) {
    this.airplaneData = _airplaneData;
    this.updateMarkerPopUps();
    this.airplaneLastLat = this.airplaneData.lat;
    this.airplaneLastLng = this.airplaneData.lng;
  }
}

updateMarkerPopUps() {
  for(var m in this.flightPlanWaypoints) {
    let waypoint  = this.flightPlanWaypoints[m];
    let navaid    = waypoint.navaid;

    // Update Distance from Airplane
    let idSpan    = "distance" + navaid.id;
    let spanObj   = document.getElementById(idSpan);
    if ( spanObj ) {
      let distance;
      if ( this.airplaneData ) {
          let distFrom = new leaflet.latLng(this.airplaneData.lat, this.airplaneData.lng);
          let distTo   = new leaflet.latLng(navaid.latitude, navaid.longitude);
          distance     = distFrom.distanceTo(distTo) * 0.000539957; // Convert meters to nautical miles
          distance     = this.utils.formatNumber(Math.round(distance)); 
      } else {
          distance = 9999;
      }
      spanObj.innerHTML = distance;
    }      
  }
}

createMarkerPopUps(event?) {
  for(var m in this.flightPlanWaypoints) {
    let waypoint  = this.flightPlanWaypoints[m];
    let htmlPopup = this.createPopUp(waypoint.navaid);

    if ( waypoint.departure1 ) {
        waypoint.departure1.setPopupContent(htmlPopup);
        waypoint.departure2.setPopupContent(htmlPopup);
    } else
    if ( waypoint.arrival1 ) { 
        waypoint.arrival1.setPopupContent(htmlPopup);
        waypoint.arrival2.setPopupContent(htmlPopup);
    } else {
      waypoint.marker1.setPopupContent(htmlPopup);
      waypoint.marker2.setPopupContent(htmlPopup);
      waypoint.marker3.setPopupContent(htmlPopup);
      waypoint.marker4.setPopupContent(htmlPopup);
      waypoint.marker5.setPopupContent(htmlPopup);
    }
  }
}

adaptFlightPlanToZoom(zoom) {
  if ( flightPlanPaths && flightPlanPaths.length > 0 ) {
    var size = "none";
    if ( map.getZoom() >= zoomIconSize1[0] &&  map.getZoom() <= zoomIconSize1[1] )   {
      size = "Size1";
      map.removeLayer(flightPlanMarkersSize2Group);
      map.removeLayer(flightPlanMarkersSize3Group);
      map.removeLayer(flightPlanMarkersSize4Group);
      map.removeLayer(flightPlanMarkersSize5Group);
      map.addLayer(flightPlanMarkersSize1Group);
      map.addLayer(flightPlanMarkersAirportGroup1);
      map.removeLayer(flightPlanMarkersAirportGroup2);
    } else 
    if ( map.getZoom() >= zoomIconSize2[0] &&  map.getZoom() <= zoomIconSize2[1] )   {
      size = "Size2";
      map.removeLayer(flightPlanMarkersSize1Group);
      map.removeLayer(flightPlanMarkersSize3Group);
      map.removeLayer(flightPlanMarkersSize4Group);
      map.removeLayer(flightPlanMarkersSize5Group);
      map.addLayer(flightPlanMarkersSize2Group);
      map.addLayer(flightPlanMarkersAirportGroup1);
      map.removeLayer(flightPlanMarkersAirportGroup2);
    } else 
    if ( map.getZoom() >= zoomIconSize3[0] &&  map.getZoom() <= zoomIconSize3[1] )   {
      size = "Size3";
      map.removeLayer(flightPlanMarkersSize1Group);
      map.removeLayer(flightPlanMarkersSize2Group);
      map.removeLayer(flightPlanMarkersSize4Group);
      map.removeLayer(flightPlanMarkersSize5Group);
      map.addLayer(flightPlanMarkersSize3Group);
      map.addLayer(flightPlanMarkersAirportGroup2);
      map.removeLayer(flightPlanMarkersAirportGroup1);
    } else 
    if ( map.getZoom() >= zoomIconSize4[0] &&  map.getZoom() <= zoomIconSize4[1] )   {
      size = "Size4";
      map.removeLayer(flightPlanMarkersSize1Group);
      map.removeLayer(flightPlanMarkersSize2Group);
      map.removeLayer(flightPlanMarkersSize3Group);
      map.removeLayer(flightPlanMarkersSize5Group);
      map.addLayer(flightPlanMarkersSize4Group);
      map.addLayer(flightPlanMarkersAirportGroup2);
      map.removeLayer(flightPlanMarkersAirportGroup1);
    } else 
    if ( map.getZoom() >= zoomIconSize5[0] &&  map.getZoom() <= zoomIconSize5[1] )   {
      size = "Size4";
      map.removeLayer(flightPlanMarkersSize1Group);
      map.removeLayer(flightPlanMarkersSize2Group);
      map.removeLayer(flightPlanMarkersSize3Group);
      map.removeLayer(flightPlanMarkersSize4Group);
      map.addLayer(flightPlanMarkersSize5Group);
      map.addLayer(flightPlanMarkersAirportGroup2);
      map.removeLayer(flightPlanMarkersAirportGroup1);  
    } else {
      map.removeLayer(flightPlanMarkersSize1Group);
      map.removeLayer(flightPlanMarkersSize2Group);
      map.removeLayer(flightPlanMarkersSize3Group);
      map.removeLayer(flightPlanMarkersSize4Group);
      map.removeLayer(flightPlanMarkersSize5Group);
      map.addLayer(flightPlanMarkersAirportGroup2);
      map.removeLayer(flightPlanMarkersAirportGroup1);
    }
    this.utils.trace("Zoom..:" + map.getZoom() + ", Size..:" + size);
  }
}

createNextDestinationMarker(navaid, iconSize) {
    let icon = iconSize.LOCATION_ICON;
    if ( "NDB" == navaid.type ) {
         icon = iconSize.NDB_ICON;
    } else
    if ( "VOR" == navaid.type ) {
         icon = iconSize.VOR_ICON;
    } else
    if ( "FIX" == navaid.type ) {
         icon = iconSize.FIX_ICON;
    } else
    if ( "Lat/Lng" == navaid.type ) {
         icon = iconSize.LATLNG_ICON;
    } else
    if ( "Airport" == navaid.type ) {
         icon = iconSize.AIRPORT_ICON;
    } else {
      this.utils.warn(navaid.type + " Not found an ICON for it!!!");
    }
    this.utils.trace("Adding next destination marker to " + navaid.latitude + ":" + navaid.longitude);
    let marker        = leaflet.marker([navaid.latitude,navaid.longitude], {icon: icon});
    let htmlPopup     = this.createPopUp(navaid);
    let markerPopUp   = marker.bindPopup(htmlPopup);

    markerPopUp.setLatLng([navaid.latitude,navaid.longitude]);
    if ( this.utils.isDesktop() ) { // Not on Mobile/Tablet?
      // Do it only for browser platform (mouseover doesn't make sense on "Touchable" platforms, there's no mouse :-P )
      let markerTooltip = this.createTooltip(navaid);
      marker.bindTooltip(markerTooltip,{opacity:0.85}).openTooltip();
    }
    return marker;
}
createNextDestinationCircle(navaid, zoom) {
    let radius;
    let weight;
    if ( zoom >= 7 ) {
      weight = 3;
      radius = 8;
    } else 
    if ( zoom >= 6 ) {
      weight = 2;
      radius = 6;
    } else 
    if ( zoom >= 5 ) {
      weight = 1;
      radius = 3;  
    } else {
      weight = 5;
      radius = 20;
    }
    this.utils.trace("Adding next destination marker to " + navaid.latitude + ":" + navaid.longitude);
    var circle = new leaflet.circleMarker([navaid.latitude,navaid.longitude],
    {
      radius: radius,
      stroke: true,
      color: 'black',
      fillColor: 'white',
      fillOpacity: 0.85,
      weight: weight,
      lineCap: 'round'
    });
    let htmlPopup    = this.createPopUp(navaid);
    let markerPopUp  = circle.bindPopup(htmlPopup);
    markerPopUp.setLatLng([navaid.latitude,navaid.longitude]);
    let toolTip      = this.createTooltip(navaid);
    circle.bindTooltip(toolTip,{opacity:0.85}).openTooltip();
    return circle;
}

createAirportMarker(navaid, iconSize) {
  let icon          = iconSize.AIRPORT_ICON;
  this.utils.trace("Adding next destination marker to " + navaid.latitude + ":" + navaid.longitude);
  let marker        = leaflet.marker([navaid.latitude,navaid.longitude], {icon: icon});
  let htmlPopup     = this.createPopUp(navaid);
  let markerPopUp   = marker.bindPopup(htmlPopup);
  markerPopUp.setLatLng([navaid.latitude,navaid.longitude]);
  if ( this.utils.isDesktop() ) {
    let markerTooltip = this.createTooltip(navaid);
    marker.bindTooltip(markerTooltip,{opacity:0.85}).openTooltip();
  }
  return marker;
}

createTooltip(navaid) {
  let html = `
      <span style="font-size:12px;"><b>` + navaid.name + `</b></span>
  `;
  return html;
}

createPopUp(navaid) {
    let paddingValue   = 3;
    let fontSizeLabel  = 12;
    let fontSizeValue  = 12;
    let fontSizeUnit   = 11;
    let fontFamily     = 'font-family:Consolas';

    if ( this.utils.isOsOrAndroidPlatform() ) {
      // No change for font family when on Mobile/Tablet
      fontFamily     = 'font-family:Courier';
    }

    let distance;
    if ( this.airplaneData ) {
        let distFrom = new leaflet.latLng(this.airplaneData.lat, this.airplaneData.lng);
        let distTo   = new leaflet.latLng(navaid.latitude, navaid.longitude);
        distance = distFrom.distanceTo(distTo) * 0.000539957; // Convert meters to nautical miles
        distance = this.utils.formatNumber(Math.round(distance)); 
    } else {
        distance = 9999;
    }

    let idCell = `
    <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;` + fontFamily + `">ID.......:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + navaid.id + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
        </td>
      </tr>
    `;

    let name = navaid.name;
    if ( navaid.type == "Lat./Long." || navaid.type == "Last Location" )  {
      idCell = "";
    }    

    var html = `
      <span style="font-size:12px;"><b>` + name + `</b></span>
      <hr>
      <table border=0 cellspacing=0 cellpadding=0>
      ` + idCell + `
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;` + fontFamily + `">Distance.:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span id="distance` + navaid.id + `" style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + distance + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">nm</span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;` + fontFamily + `">Navaid...:</span>
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + navaid.type + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;` + fontFamily + `">Latitude.:</span>&nbsp;&nbsp;
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + navaid.latitude + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
        </td>
      </tr>
      <tr>
        <td>
          <span style="font-size:` + fontSizeLabel + `px;` + fontFamily + `">Longitude:</span>&nbsp;&nbsp;
        </td>
        <td align="right" style="padding-right:` + paddingValue + `px;">
          <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + navaid.longitude + `</span>
        </td>
        <td>
          <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
        </td>
      </tr>
      </table>
    `;

    var containerBtn = this.createButtonPauseHere(navaid);
    var container = leaflet.DomUtil.create('div');
    container.innerHTML = html;
    container.appendChild(containerBtn);
    return container;
    //return html;
  }

  private createButtonPauseHere(navaid) {
    var pauseAscii             = '&#9612;&#9612;';
    var separator              = leaflet.DomUtil.create('hr');
    var containerBtn           = leaflet.DomUtil.create('div');
    var tableBtn               = leaflet.DomUtil.create('table');
    var tableBtnTr1            = leaflet.DomUtil.create('tr');
    var tableBtnTdBtnBtnLessNm = leaflet.DomUtil.create('td');
    var tableBtnTdBtnBtnMoreNm = leaflet.DomUtil.create('td');
    var tableBtnTdBtnPause     = leaflet.DomUtil.create('td');
    var buttonPauseName        = 'btnPause' + navaid.id;

    //containerBtn.setAttribute('style','margin-left:-1px;');
    containerBtn.setAttribute('style','width:198px;');

    separator.setAttribute("style","line-height:5px;");
    tableBtn.setAttribute("width", "100%");
    tableBtnTdBtnBtnLessNm.setAttribute("align", "right");
    tableBtnTdBtnBtnMoreNm.setAttribute("align", "left");
    tableBtnTdBtnPause.setAttribute("align", "center");

    var btnLessNm = leaflet.DomUtil.create('ion-button', '', containerBtn);
    btnLessNm.setAttribute('type', 'button');
    //btnLessNm.setAttribute('class', 'buttonPopup buttonPopupMoreLess');
    btnLessNm.innerHTML = ' &#8722; ';

    var btnMoreNm = leaflet.DomUtil.create('ion-button', '', containerBtn);
    btnMoreNm.setAttribute('type', 'button');
    //btnMoreNm.setAttribute('class', 'buttonPopup buttonPopupMoreLess');
    btnMoreNm.innerHTML = ' &#43; ';

    var initDist = 10;
    if ( document.getElementById(buttonPauseName) ) {
      initDist = Number.parseInt(document.getElementById(buttonPauseName).getAttribute('nm'));
    }

    var btnPauseHere = leaflet.DomUtil.create('ion-button', '', containerBtn);
    btnPauseHere.setAttribute('type', 'button');
    //btnPauseHere.setAttribute('class', 'buttonPopup buttonPopupPause');
    btnPauseHere.setAttribute('id',buttonPauseName);
    btnPauseHere.setAttribute('nm',''+initDist);
    btnPauseHere.innerHTML = pauseAscii + ' ' + this.utils.pad(initDist, 3) +'nm';

    tableBtnTdBtnBtnLessNm.appendChild(btnLessNm);
    tableBtnTdBtnBtnMoreNm.appendChild(btnMoreNm);
    tableBtnTdBtnPause.appendChild(btnPauseHere);
    tableBtnTr1.appendChild(tableBtnTdBtnBtnLessNm);
    tableBtnTr1.appendChild(tableBtnTdBtnPause);
    tableBtnTr1.appendChild(tableBtnTdBtnBtnMoreNm);
    tableBtn.appendChild(tableBtnTr1);
    containerBtn.appendChild(separator);
    containerBtn.appendChild(tableBtn);

    leaflet.DomEvent.on(btnLessNm, 'click', (e: any) => {
      this.lessDistancePause(navaid, pauseAscii);
      e.stopPropagation();
    });
    leaflet.DomEvent.on(btnLessNm, 'dblclick', (e: any) => {
      this.lessDistancePause(navaid, pauseAscii, 35);
      e.stopPropagation();
    });

    leaflet.DomEvent.on(btnMoreNm, 'click', (e: any) => {
      this.moreDistancePause(navaid, pauseAscii);
      e.stopPropagation();
    });

    leaflet.DomEvent.on(btnMoreNm, 'dblclick', (e: any) => {
      this.moreDistancePause(navaid, pauseAscii, 35);
      e.stopPropagation();
    });

    leaflet.DomEvent.on(btnPauseHere, 'click', (e: any) => {
        e.stopPropagation();
        var buttonPause = document.getElementById(buttonPauseName);
        var dist        = buttonPause.getAttribute('nm');
        var msg         = "{CONFIG_PAUSE_NAVAID}|" + navaid.id + "|" + navaid.type + "|" + dist;

        if (  this.xpWsSocket.getWebSocket().readyState == WS_OPEN ) {
            this.utils.info("Send command config to X-Plane: " + msg);
            this.xpWsSocket.getWebSocket().send(msg);
        } else {
            console.log("NOT OPENED!");
        }
    });
    return containerBtn;
  }


  private moreDistancePause(navaid: any, pauseAscii: string, amount? : number) {
      if ( !amount || amount == 0 ) {
        amount = 5;
      }
      var buttonPause = document.getElementById('btnPause' + navaid.id);
      var dist        = buttonPause.getAttribute('nm');
      var newDist     = amount + Number.parseInt(dist);
      if ( newDist > 995 ) {
        newDist = 995;
      }
      buttonPause.setAttribute('nm', '' + newDist);
      buttonPause.innerHTML = pauseAscii + ' ' + this.utils.pad(newDist, 3) + 'nm ';
      }

      private lessDistancePause(navaid: any, pauseAscii: string, amount? : number) {
      if ( !amount || amount == 0 ) {
        amount = 5;
      }
      var buttonPause = document.getElementById('btnPause' + navaid.id);
      var dist        = buttonPause.getAttribute('nm');
      var newDist     = Number.parseInt(dist) - amount;
      if (newDist < 5) {
        newDist = 5;
      }
      buttonPause.setAttribute('nm', '' + newDist);
      buttonPause.innerHTML = pauseAscii + ' ' + this.utils.pad(newDist, 3) + 'nm ';
  }
}
