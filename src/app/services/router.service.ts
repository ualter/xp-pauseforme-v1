import { Injectable } from "@angular/core";
import { UtilsService } from "./utils.service";
import { AviationService } from './aviation.service';
import leaflet from 'leaflet';

const ICON_WIDTH         = 100;
const ICON_HEIGHT        = 50;
const ICON_ANCHOR_WIDTH  = ICON_WIDTH / 4;
const ICON_ANCHOR_HEIGHT = ICON_WIDTH / 2;

var NDB_ICON = leaflet.icon({
    iconUrl:      'assets/imgs/icon_ndb_v2.png',
    shadowUrl:    'assets/imgs/icon_ndb_v2_shadow.png',
    iconSize:     [ICON_WIDTH,ICON_HEIGHT],
    shadowSize:   [ICON_WIDTH,ICON_HEIGHT],
    iconAnchor:   [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],  // point of the icon which will correspond to marker's location
    shadowAnchor: [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],  // the same for the shadow
    popupAnchor:  [0,((ICON_HEIGHT/2) + 23) * -1]  // point from which the popup should open relative to the iconAnchor
});
var VOR_ICON = leaflet.icon({
  iconUrl:      'assets/imgs/icon_vor_v2.png',
  shadowUrl:    'assets/imgs/icon_vor_v2_shadow.png',
  iconSize:     [ICON_WIDTH,ICON_HEIGHT],
  shadowSize:   [ICON_WIDTH,ICON_HEIGHT],
  iconAnchor:   [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  shadowAnchor: [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  popupAnchor:  [0,((ICON_HEIGHT/2) + 23) * -1]
});
var FIX_ICON = leaflet.icon({
  iconUrl:      'assets/imgs/icon_fix_v2.png',
  shadowUrl:    'assets/imgs/icon_fix_v2_shadow.png',
  iconSize:     [ICON_WIDTH,ICON_HEIGHT],
  shadowSize:   [ICON_WIDTH,ICON_HEIGHT],
  iconAnchor:   [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  shadowAnchor: [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  popupAnchor:  [0,((ICON_HEIGHT/2) + 23) * -1]
});
var LATLNG_ICON = leaflet.icon({
  iconUrl:      'assets/imgs/icon_latlng_v2.png',
  shadowUrl:    'assets/imgs/icon_latlng_v2_shadow.png',
  iconSize:     [ICON_WIDTH,ICON_HEIGHT],
  shadowSize:   [ICON_WIDTH,ICON_HEIGHT],
  iconAnchor:   [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  shadowAnchor: [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  popupAnchor:  [0,((ICON_HEIGHT/2) + 23) * -1]
});
var LOCATION_ICON = leaflet.icon({
  iconUrl:      'assets/imgs/icon_location_v2.png',
  shadowUrl:    'assets/imgs/icon_location_v2_shadow.png',
  iconSize:     [ICON_WIDTH,ICON_HEIGHT],
  shadowSize:   [ICON_WIDTH,ICON_HEIGHT],
  iconAnchor:   [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  shadowAnchor: [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  popupAnchor:  [0,((ICON_HEIGHT/2) + 23) * -1]
});
var AIRPORT_ICON = leaflet.icon({
  iconUrl:      'assets/imgs/icon_airport_v2.png',
  shadowUrl:    'assets/imgs/icon_airport_v2_shadow.png',
  iconSize:     [ICON_WIDTH,ICON_HEIGHT],
  shadowSize:   [ICON_WIDTH,ICON_HEIGHT],
  iconAnchor:   [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  shadowAnchor: [ICON_ANCHOR_WIDTH,ICON_ANCHOR_HEIGHT],
  popupAnchor:  [0,((ICON_HEIGHT/2) + 23) * -1]
});


var map;
var nextDestVector;

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  vectorPath = [];

    constructor(public utils: UtilsService,
                public aviation: AviationService) {

    }

    setMap(_map) {
        map = _map;
    }

    /*
    * Create or Update the next destination point if it was sent and programmed by X-Plane plugin
    */
    createUpdateNextDestinationMarker(airplaneData) {
        let nextDest;
        // Check if there's a next destination programmed
        if ( airplaneData.nextDestination.fms.status != 0 || airplaneData.nextDestination.gps.name != "NOT FOUND" ) {
            if ( airplaneData.nextDestination.fms.status != 0 ) {
               nextDest = airplaneData.nextDestination.fms;
            } else 
            if ( airplaneData.nextDestination.gps.name != "NOT FOUND" ) {
               nextDest = airplaneData.nextDestination.gps;
            }

            // Let's create the Marker, it does not exist
            if ( this.vectorPath.length < 1 ) {
                if ( nextDest ) { 
                    let nextDestinationMarker    = this.createNextDestinationMarker(nextDest);
                    let currentDestinationMarker = leaflet.marker([airplaneData.lat,airplaneData.lng], {icon: LOCATION_ICON}).addTo(map); 

                    let htmlPopup = this.currentLocationHtmlPopup(currentDestinationMarker,[airplaneData.lat,airplaneData.lng],airplaneData);
                    currentDestinationMarker.bindPopup(htmlPopup);
                    
                    /*currentDestinationMarker.bindTooltip("Last Location",{
                      sticky: false,
                      direction: "left",
                      opacity: 0.5,
                      permanent: true
                    }).openTooltip();*/

                    // Make the plane position as the first FROM 
                    let nextDestAirplane       = <any>{};
                    nextDestAirplane.latitude  = airplaneData.lat;
                    nextDestAirplane.longitude = airplaneData.lng;
                    nextDestAirplane.name      = "Last Location";
                    nextDestAirplane.type      = "Last Location";
                    nextDestAirplane.id        = "";
                    
                    let route  = new Route();
                    route.markerTo     = nextDestinationMarker;
                    route.markerFrom   = currentDestinationMarker;
                    route.objTo        = nextDest;
                    route.objFrom      = nextDestAirplane; 
                    this.vectorPath.push(route);
                }
            } else {
                // Let's update the Next Destination
                let curLat = this.vectorPath[this.vectorPath.length-1].markerTo.getLatLng().lat;
                let curLng = this.vectorPath[this.vectorPath.length-1].markerTo.getLatLng().lng;

                if ( (nextDest.latitude != curLat) || (nextDest.longitude != curLng) ) {
                    // Changing to other destination
                    let nextDestinationMarker    = this.createNextDestinationMarker(nextDest);
                    let currentDestinationMarker = this.vectorPath[this.vectorPath.length-1].markerTo;
                    let route  = new Route();
                    route.markerTo   = nextDestinationMarker;
                    route.markerFrom = currentDestinationMarker;
                    route.objTo      = nextDest;
                    route.objFrom    = this.vectorPath[this.vectorPath.length-1].objTo;
                    this.vectorPath.push(route);
                    // Remove the old FROM destination
                    map.removeLayer(this.vectorPath[this.vectorPath.length-2].markerFrom);
                } else {
                    // (TO) Next destination, only updating the Popup info (distance reaming, time, etc.)
                    let htmlPopup = this.destinationHtmlPopup(nextDest);
                    this.vectorPath[this.vectorPath.length-1].markerTo.setPopupContent(htmlPopup);
                    // (FROM) Previous destination, only updating the Popup info (distance reaming, time, etc.) 
                    htmlPopup = this.destinationHtmlPopup(this.vectorPath[this.vectorPath.length-1].objFrom, this.vectorPath[this.vectorPath.length-1].markerFrom, [airplaneData.lat,airplaneData.lng]);
                    this.vectorPath[this.vectorPath.length-1].markerFrom.setPopupContent(htmlPopup);
                }
            }
        } else {
            // Let's remove the Marker (if it were added before), there isn't any next destination anymore
            if ( this.vectorPath.length > 1 ) {
                map.removeLayer(this.vectorPath[this.vectorPath.length-1]);
            }
        }

        if ( nextDest ) {
            let route  = this.vectorPath[this.vectorPath.length-1];
            let pointA = new leaflet.LatLng(route.markerFrom.getLatLng().lat, route.markerFrom.getLatLng().lng);
            let pointB = new leaflet.LatLng(route.markerTo.getLatLng().lat, route.markerTo.getLatLng().lng);
            let pointList = [pointA, pointB];
            // Add vector from airplane to nextDest 
            if ( !nextDestVector ) {
              // Creation
              nextDestVector = new leaflet.Polyline(pointList, {
                  color: 'blue',
                  weight: 2,
                  opacity: 0.5,
                  smoothFactor: 5
              });
              nextDestVector.addTo(map);
            } else {
              // Update
              nextDestVector.setLatLngs(pointList);
            }
        }
    }

    createNextDestinationMarker(nextDest) {
        let icon = LOCATION_ICON;
        if ( "NDB" == nextDest.type ) {
             icon = NDB_ICON;
        } else
        if ( "VOR" == nextDest.type ) {
             icon = VOR_ICON;
        } else
        if ( "FIX" == nextDest.type ) {
             icon = FIX_ICON;
        } else
        if ( "Lat/Lng" == nextDest.type ) {
             icon = LATLNG_ICON;
        } else
        if ( "Airport" == nextDest.type ) {
             icon = AIRPORT_ICON;
        } else {
          this.utils.warn(nextDest.type + " Not found an ICON for it!!!");
        }
        this.utils.trace("Adding next destination marker to " + nextDest.latitude + ":" + nextDest.longitude);
        var nextDestinationMarker    = leaflet.marker([nextDest.latitude,nextDest.longitude], {icon: icon}).addTo(map);
        let htmlPopup                = this.destinationHtmlPopup(nextDest);
        var nextDestinationPopUp     = nextDestinationMarker.bindPopup(htmlPopup);
        nextDestinationPopUp.setLatLng([nextDest.latitude,nextDest.longitude]);
        return nextDestinationMarker;
    }

    destinationHtmlPopup(navaid, markerFrom?, airplaneLocation?) {
        let paddingValue  = 3;
        let fontSizeLabel = 12;
        let fontSizeValue = 12;
        let fontSizeUnit  = 11;

        let time;
        if ( navaid.fmsTime ) {
          time = navaid.fmsTime;
        } else {
          time = navaid.dmeTime;
        }
        let timeCell = `
          <tr>
            <td>
              <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Time.....:</span>
            </td>
            <td align="right" style="padding-right:` + paddingValue + `px;">
              <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + time + `</span>
            </td>
            <td>
              <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
            </td>
          </tr>
        `;
        if ( markerFrom ) {
          timeCell = "";
        }

        let distance;
        if ( markerFrom ) {
            distance = markerFrom.getLatLng().distanceTo(airplaneLocation) * 0.000539957; // Convert meters to nautical miles
            distance = this.utils.formatNumber(Math.round(distance)) ; 
        } else {
            distance = this.utils.formatNumber(navaid.distance);
        }
    
        let idCell = `
        <tr>
            <td>
              <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">ID.......:</span>
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
              <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Distance.:</span>
            </td>
            <td align="right" style="padding-right:` + paddingValue + `px;">
              <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + distance + `</span>
            </td>
            <td>
              <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">nm</span>
            </td>
          </tr>
          ` + timeCell + `
          <tr>
            <td>
              <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Navaid...:</span>
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
              <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Latitude.:</span>&nbsp;&nbsp;
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
              <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Longitude:</span>&nbsp;&nbsp;
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
        return html;
    }

    currentLocationHtmlPopup(markerFrom, airplaneLocation, airplaneData) {
      let paddingValue  = 3;
      let fontSizeLabel = 12;
      let fontSizeValue = 12;
      let fontSizeUnit  = 11;
  
      let distance = Math.round(markerFrom.getLatLng().distanceTo(airplaneLocation) * 1.94384); // Convert meters to nautical miles
  
      let name = "Last Location";
      var html = `
        <span style="font-size:12px;"><b>` + name + `</b></span>
        <hr>
        <table border=0 cellspacing=0 cellpadding=0>
        <tr>
          <td>
            <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Distance.:</span>
          </td>
          <td align="right" style="padding-right:` + paddingValue + `px;">
            <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + distance + `</span>
          </td>
          <td>
            <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;">nm</span>
          </td>
        </tr>
        <tr>
          <td>
            <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Latitude.:</span>&nbsp;&nbsp;
          </td>
          <td align="right" style="padding-right:` + paddingValue + `px;">
            <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + airplaneData.latitude + `</span>
          </td>
          <td>
            <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
          </td>
        </tr>
        <tr>
          <td>
            <span style="font-size:` + fontSizeLabel + `px;font-family:Consolas">Longitude:</span>&nbsp;&nbsp;
          </td>
          <td align="right" style="padding-right:` + paddingValue + `px;">
            <span style="font-size:` + fontSizeValue + `px;color:blue;font-weight:bold;">` + airplaneData.longitude + `</span>
          </td>
          <td>
            <span style="color:black;font-weight:bold;font-size:` + fontSizeUnit +`px;"> </span>
          </td>
        </tr>
        </table>
      `;
      return html;
    }
}

class Route {
  markerFrom:any;
  markerTo:any;
  objFrom:any;
  objTo:any;
}