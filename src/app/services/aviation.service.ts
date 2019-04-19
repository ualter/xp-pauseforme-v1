import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AviationService {

   //constructor(private utils: Utils) {

    //}

    // Calculate the bearing based on the current and last position
    public bearing(lon1, lat1, lon2, lat2) {
      lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
      lat2 = lat2 * Math.PI / 180;

      var y     = Math.sin(lon2 - lon1) * Math.cos(lat2);
      var x     = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
      var brng  = Math.atan2(y, x);
      var bearing = brng / Math.PI * 180;

      /*if (bearing == 0) {
          console.log("[" +lon1 + "," + lat1 + " [" + lon2 + "," + lat2 + "] = " + bearing);
      }*/
      return bearing;
  }

  // Calculate the distance based on the two given coordinates (Lat,Lng)
  public distance(lon1, lat1, lon2, lat2) {
      var R = 6372.8;
      lat1  = lat1 * Math.PI / 180;
      lat2  = lat2 * Math.PI / 180;
      var deltalat = lat2 - lat1;
      var deltalon = (lon2 - lon1) * Math.PI / 180;
      var a = Math.sin(deltalat / 2) * Math.sin(deltalat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltalon / 2) * Math.sin(deltalon / 2);
      var c = 2 * Math.asin(Math.sqrt(a));
      return R * c;
  }
}
