
//
// geospatial functions specific to Drivewyze shapes
//

module.exports = {};

const func = require("../../lib/core/func.js"),
      util = require("../../lib/core/util.js"),
      fm = require('../../lib/funcs/math.js');


function latitude(gps) {
  if (util.isdict(gps))
    return gps.latitude;
  if (util.islist(gps))
    return gps[1];
  return null;
}

function longitude(gps) {
  if (util.isdict(gps))
    return gps.longitude;
  if (util.islist(gps))
    return gps[0];
  return null;
}

function bearing(gps) {
  if (util.isdict(gps))
    return gps.bearing;
  if (util.islist(gps))
    return gps[2];
  return null;
}

function speed(gps) {
  if (util.isdict(gps))
    return gps.speed;
  if (util.islist(gps))
    return gps[3];
  return null;
}

function timestamp(gps) {
  if (util.isdict(args[0]))
    return args[0].timestamp;
  if (util.islist(args[0]))
    return args[0][4];
  return null;  
}

function accuracy(gps) {
  if (util.isdict(gps))
    return gps.accuracy;
  if (util.islist(gps))
    return gps[5];
  return null;
}

function quality(gps) {
  if (util.isdict(args[0]))
    return args[0].quality;
  if (util.islist(args[0]))
    return args[0][6];
  return null;
}

function lensq (pA, pB) {
  var latA = latitude(pA),
      latB = latitude(pB),
      longA = longitude(pA),
      longB = longitude(pB);
  var X = latA - latB;
  var Y = longA - longB;
  return (X * X) + (Y * Y);
}


// using the haversine formula.
const EARTH_RADIUS = 6371;
const EPSILON = 0.000000001;


function earthradius () {
  return EARTH_RADIUS;
}


function distance (pA, pB) {
  var latA = latitude(pA),
      latB = latitude(pB),
      longA = longitude(pA),
      longB = longitude(pB);
  var degreesLatitude = fm.rad(latB - latA);
  var degreesLongitude = fm.rad(longB - longA);
  var a = Math.pow(Math.sin(degreesLatitude / 2), 2) +
    Math.cos(fm.rad([latA])) * Math.cos(fm.rad([latB])) *
    Math.pow(Math.sin(degreesLongitude / 2), 2);
  var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return b * earthradius();
}


function toBearing (b) {
  return (b + 360) % 360;
}

function calcbearing (pA, pB) {
  var latA = latitude(pA),
      latB = latitude(pB),
      longA = longitude(pA),
      longB = longitude(pB);
  var deltaLong = fm.rad(longB - longA);
  var x = Math.sin(deltaLong) * Math.cos(fm.rad(latB));
  var y = Math.cos(fm.rad(latA)) * Math.sin(fm.rad(latB)) - Math.sin(fm.rad(latA)) * Math.cos(fm.rad(latB)) * Math.cos(deltaLong);
  return toBearing(fm.deg(Math.atan2(x, y)));
}


function vecminus(pA, pB) {
  var dist = distance(pA, pB);
  var bear = calcbearing(pA, pB);
  return {
    "distance": dist,
    "bearing": bear
  }
}


function locadd (pA, pB) {
  var latA = latitude(pA),
      latB = latitude(pB),
      longA = longitude(pA),
      longB = longitude(pB);
  return [ longA + longB, latA + latB ];
}


function locsub (pA, pB) {
  var latA = latitude(pA),
      latB = latitude(pB),
      longA = longitude(pA),
      longB = longitude(pB);
  return [ longA - longB, latA - latB ];
}


function locmul (pA, K) {
  var latA = latitude(pA),
      longA = longitude(pA);
  return [ longA * K, latA * K ];
}


function locdiv (pA, K) {
  var latA = latitude(pA),
      longA = longitude(pA);
  return [ longA / K, latA / K ];
}


function locdot (pA, pB) {
  var latA = latitude(pA),
      latB = latitude(pB),
      longA = longitude(pA),
      longB = longitude(pB);
  return (latA * latB) + (longA * longB);
}


function getpolygon(pShape) {
  if (util.islist(pShape))
    return pShape;
  if (!util.isdict(pShape))
    return null;
  if (util.isdict(pShape.location) && util.islist(pShape.location.coordinates))
    return pShape.location.coordinates;
  if (util.islist(pShape.poly))
    return pShape.poly;
  return null;
}


function getring(pShape, i) {
  var poly = getpolygon(pShape);
  if (!util.islist(poly))
    return null;
  return poly[i];
}


function distancetoedge (pP, pV, pW) {
  var L2 = lensq(pV, pW);
  if (L2 < EPSILON)
    return distance(pP, pV);

  var t = locdot(locsub(pP, pV), locsub(pW, pV)) / L2;

  if (t < 0.0)
    return distance(pP, pV);
  if (t > 1.0)
    return distance(pP, pW);

  var lProjection = locadd(pV, locmul(locsub(pW, pV), t));
  return distance(pP, lProjection);
}


function pointinring (pPt, pRing) {
  var c = false,
      ptCount = pRing.length,
      pLat = latitude(pPt),
      pLong = longitude(pPt);

  var tmpJ = pRing[0];
  for (var i = 1; i < ptCount; i++) {
    var tmpI = pRing[i];
    if ((tmpI[1] < pLat && pLat < tmpJ[1]) || (tmpJ[1] < pLat && pLat < tmpI[1]))
      if (pLong < ((tmpJ[0] - tmpI[0]) * (pLat - tmpI[1]) / (tmpJ[1] - tmpI[1]) + tmpI[0]))
        c = !c;
    tmpJ = tmpI;
  }

  return c;
}


function pointinpolygon (pPt, pShape) {
  var poly = getpolygon(pShape);
  if (!pointinring(pPt, getring(poly, 0)))
    return false;
  for (var i = 1; i < poly.length; i++)
    if (pointinring(pPt, getring(poly, i)))
      return false;
  return true;
}



function distancetoshape (pLoc, pShape) {
  if (pointinpolygon(pLoc, pShape))
    return 0.0;
  var ring = getring(pShape, 0);
  if (!util.islist(ring))
    return null;
  var lShortest = 9999999.0;
  for (var i = 0; i < ring.length; i++) {
    var j = (i + 1) % ring.length;
    var p0 = ring[i];
    var p1 = ring[j];
    var dn = distancetoedge(pLoc, p0, p1);
    if (dn < lShortest)
      lShortest = dn;
  }

  return lShortest;
}



function area (polygon) {
  var area = 0.0;
  var ring = getring(polygon, 0);
  if (!util.islist(ring))
    return null;

  var len = ring.length - 1;
  var j = len - 1;
  for (var i = 0; i < len; i++) {
    area += longitude(ring[i]) * latitude(ring[j]);
    area -= latitude(ring[i]) * longitude(ring[j]);
    j = i;
  }
  return Math.abs(area / 2);
}


function vecplus (p0, bearing, distanceInKm) {
  var lat1 = fm.rad(latitude(p0));
  var lon1 = fm.rad(longitude(p0));
  bearing = fm.rad(bearing);
  var radius2 = distanceInKm / this.EARTH_RADIUS;
  var lat2 = Math.asin(Math.sin(lat1) * Math.cos(radius2) +
    Math.cos(lat1) * Math.sin(radius2) * Math.cos(bearing));
  var lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(radius2) * Math.cos(lat1),
    Math.cos(radius2) - Math.sin(lat1) * Math.sin(lat2));
  lat2 = fm.deg(lat2);
  lon2 = fm.deg(lon2);
  return [lon2, lat2];
}


function interpolate (p0, p1, ratio) {
  return locadd(p0, locmul(locsub(p1, p0), ratio));
}



function centroid (pShape) {
  if (util.isdict(pShape))
    if (pShape.hasOwnProperty("centroid"))
      return pShape["centroid"];

  var lPoints = getring(pShape, 0);
  if (!util.islist(lPoints))
    return null;

  var len = lPoints.length;
  if (len > 2)
    len--;

  var lat = 0,
      long = 0;
  for (var i = 0; i < len; i++) {
    lat += latitude(lPoints[i]);
    long += longitude(lPoints[i]);
  }
  lat /= len;
  long /= len;
  var point1 = [ long, lat ];
  pShape["centroid"] = point1;
  return point1;
}


function between (pX, pY, pZ) {
  if (pY < pZ)
    return pX >= pY && pX <= pZ;
  else
    return pX >= pZ && pX <= pY;
}


function similarbearings (pA1, pA2, pB, pTolerance) {
  var b1 = Math.abs(calcbearing(pA1, pB));
  var b2 = Math.abs(calcbearing(pA2, pB));
  var delta = Math.abs(b1 - b2);
  if (delta > 180.0)
    delta = Math.abs(delta - 360.0);
  return (delta <= pTolerance);
}

function $similarbearings(args, scope) {
  return similarbearings(args[0], args[1], args[2], args[3]);
}



function linecrossed (p0, p1, q0, q1) {
  var xA = longitude(p0);
  var yA = latitude(p0);
  var xB = longitude(p1);
  var yB = latitude(p1);
  var xC = longitude(q0);
  var yC = latitude(q0);
  var xD = longitude(q1);
  var yD = latitude(q1);

  var xp1 = ((xA - xC) * (yD - yC) - (yA - yC) * (xD - xC)) * ((xB - xC) * (yD - yC) - (yB - yC) * (xD - xC));
  var xp2 = ((xC - xA) * (yB - yA) - (yC - yA) * (xB - xA)) * ((xD - xA) * (yB - yA) - (yD - yA) * (xB - xA));

  return (xp1 < 0 && xp2 < 0);
}

function $linecrossed(args, scope) {
  return linecrossed(args[0], args[1], args[2], args[3]);
}


func.def({ name: "latitude", body: func.unary(latitude) });
func.def({ name: "longitude", body: func.unary(longitude) });
func.def({ name: "bearing", body: func.unary(bearing) });
func.def({ name: "speed", body: func.unary(speed) });
func.def({ name: "timestamp", body: func.unary(timestamp) });
func.def({ name: "accuracy", body: func.unary(accuracy) });
func.def({ name: "quality", body: func.unary(quality) });
func.def({ name: "lensq", body: func.binary(lensq) });
func.def({ name: "earthradius", body: func.constant(earthradius) });
func.def({ name: "distance", body: func.binary(distance) });
func.def({ name: "calcbearing", body: func.binary(calcbearing) });
func.def({ name: "vecminus", body: func.binary(vecminus) });
func.def({ name: "locadd", body: func.binary(locadd) });
func.def({ name: "locsub", body: func.binary(locsub) });
func.def({ name: "locmul", body: func.binary(locmul) });
func.def({ name: "locdiv", body: func.binary(locdiv) });
func.def({ name: "locdot", body: func.binary(locdot) });
func.def({ name: "getpolygon", body: func.unary(getpolygon) });
func.def({ name: "getring", body: func.binary(getring) });
func.def({ name: "distancetoedge", body: func.trinary(distancetoedge) });
func.def({ name: "pointinring", body: func.binary(pointinring) });
func.def({ name: "pointinpolygon", body: func.binary(pointinpolygon) });
func.def({ name: "inshape", body: func.binary(pointinpolygon) });
func.def({ name: "distancetoshape", body: func.binary(distancetoshape) });
func.def({ name: "area", body: func.unary(area) });
func.def({ name: "vecplus", body: func.binary(vecplus) });
func.def({ name: "interpolate", body: func.trinary(interpolate) });
func.def({ name: "centroid", body: func.unary(centroid) });
func.def({ name: "between", body: func.trinary(between) });
func.def({ name: "similarbearings", body: $similarbearings });
func.def({ name: "linecrossed", body: $linecrossed });


