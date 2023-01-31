//
// Sunrise / sunset calculations
//

const fm = require("./math.js");


dayMs = 86400000;
J1970 = 2440588;
J2000 = 2451545;

function toJulian(date) {
  return date.valueOf() / dayMs - 0.5 + J1970;
}

function fromJulian(j) {
  return new Date((j + 0.5 - J1970) * dayMs);
}

function toDays(date) {
  return toJulian(date) - J2000;
}


obliquity = fm.rad(23.4397);
sinobl = Math.sin(obliquity);
cosobl = Math.cos(obliquity);

function rightAscension(l, b) {
  return Math.atan2(Math.sin(l) * cosobl - Math.tan(b) * sinobl, Math.cos(l));
}

function declination(l, b) {
  return Math.asin(Math.sin(b) * cosobl + Math.cos(b) * sinobl * Math.sin(l));
}

function azimuth(H, phi, dec) {
  return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
}

function altitude(H, phi, dec) {
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

function siderealTime(d, lw) {
  return fm.rad((280.16 + 360.9856235 * d) - lw);
}

function astroRefraction(h) {
  if (h < 0)
    h = 0;
  return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

function solarMeanAnomaly(d) {
  return fm.rad(357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M) {
  var C = fm.rad((1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))),
    P = fm.rad(102.9372);
  return M + C + P + Math.PI;
}

function sunCoords(d) {
  var M = solarMeanAnomaly(d),
    L = eclipticLongitude(M);

  return {
    dec: declination(L, 0),
    ra: rightAscension(L, 0)
  }
}


function getPosition(date, lat, lng) {
  var lw = fm.rad(-lng),
    phi = fm.rad(lat),
    d = toDays(date),
    c = sunCoords(d),
    H = siderealTime(d, lw) - c.ra;

  return {
    azimuth: azimuth(H, phi, c.dec),
    altitude: altitude(H, phi, c.dec)
  };
};


sunTimesData = [
  [-0.833, 'sunrise', 'sunset'],
  [-0.3, 'sunriseEnd', 'sunsetStart'],
  [-6, 'dawn', 'dusk'],
  [-12, 'nauticalDawn', 'nauticalDusk'],
  [-18, 'nightEnd', 'night'],
  [6, 'goldenHourEnd', 'goldenHour']
];

function addSunTime(angle, riseName, setName) {
  sunTimesData.push([angle, riseName, setName]);
};

J0 = 0.0009;

function julianCycle(d, lw) {
  return Math.round(d - J0 - lw / (2 * Math.PI));
}

function approxTransit(Ht, lw, n) {
  return J0 + (Ht + lw) / (2 * Math.PI) + n;
}

function solarTransitJ(ds, M, L) {
  return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h, phi, d) {
  return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
}

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {
  var w = hourAngle(h, phi, dec),
    a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}


// calculates sun times for a given date and latitude/longitude

function sunTimes(date, lat, lng) {
  var lw = fm.rad(-lng),
    phi = fm.rad(lat),

    d = toDays(date),
    n = julianCycle(d, lw),
    ds = approxTransit(0, lw, n),

    M = solarMeanAnomaly(ds),
    L = eclipticLongitude(M),
    dec = declination(L, 0),

    Jnoon = solarTransitJ(ds, M, L),

    i, len, time, Jset, Jrise;


  var result = {
    solarNoon: fromJulian(Jnoon),
    nadir: fromJulian(Jnoon - 0.5)
  };

  for (i = 0, len = sunTimesData.length; i < len; i += 1) {
    time = sunTimesData[i];

    Jset = getSetJ(fm.rad(time[0]), lw, phi, dec, n, M, L);
    Jrise = Jnoon - (Jset - Jnoon);

    result[time[1]] = fromJulian(Jrise);
    result[time[2]] = fromJulian(Jset);
  }

  return result;
}


function dateOrNow(ops) {
  return ops.length > 0 ? __todate(ops[0]) : new Date().getTime();
}


function sunTimesOps(ops, ec) {
  var dt = dateOrNow(ops);
  var lastgps = ops['lastgps']([], ec, true);
  var lat = ops.length > 2 ? __tonum(ops[1]) : (__isgps(lastgps) ? lastgps.getLatitude() : null);
  var long = ops.length > 2 ? __tonum(ops[2]) : (__isgps(lastgps) ? lastgps.getLongitude() : null);
  if (lat == null || long == null)
    return null;
  return sunTimes(dt, lat, long);
}


ops['suntimes'] = sunTimesOps;


function opsunrise'] = (ops) {
  var st = sunTimesOps(ops);
  if (__isdict(st))
    return st.sunrise;
}


function opsunset'] = (ops) {
  var st = sunTimesOps(ops);
  if (__isdict(st))
    return st.sunset;
}


function opssnight'] = (ops, ec) {
  var sunrise = __tonum(ops['sunrise'](ops, ec, true));
  var sunset = __tonum(ops['sunset'](ops, ec, true));
  var now = __tonum(dateOrNow(ops));
  return (now <= sunrise || now >= sunset);
}
