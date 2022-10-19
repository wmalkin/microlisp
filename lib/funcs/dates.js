//
// basic date/time operaitions
//

module.exports = {};


const func = require("../core/func.js");


// todo: deep comparisons of structs

function $date(args, scope) {
    return null;
}


function $now(args, scope) {
    return new Date();
}


function $nows(args, scope) {
    return new Date().getTime();
}


this.ops['now'] = this.Constant(() => {
  return Math.floor((new Date().getTime()) / 1000);
})


this.ops['nowms'] = this.ops['utcnow'] = this.Constant(() => {
  return new Date().getTime();
})

this.ops['gmtms'] = this.UnaryDate((dv) => {
  return dv.getUTCMilliseconds();
})


this.ops['gmtdate'] = this.UnaryDate((dv) => {
  if (dv) {
    return {
      "year": dv.getUTCFullYear(),
      "month": dv.getUTCMonth() + 1,
      "day": dv.getUTCDate(),
      "hour": dv.getUTCHours(),
      "min": dv.getUTCMinutes(),
      "sec": dv.getUTCSeconds(),
      "ms": dv.getUTCMilliseconds(),
      "dow": dv.getUTCDay(),
      "local": null
    }
  }
})


this.ops['localms'] = this.UnaryDate((dv) => {
  return dv.getUTCMilliseconds();
})


this.ops['localdate'] = this.UnaryDate((dv) => {
  if (dv) {
    return {
      "year": dv.getFullYear(),
      "month": dv.getMonth() + 1,
      "day": dv.getDate(),
      "hour": dv.getHours(),
      "min": dv.getMinutes(),
      "sec": dv.getSeconds(),
      "ms": dv.getMilliseconds(),
      "dow": dv.getDay(),
      "local": null
    }
  }
})


this.ops['fdate'] = this.Binary((dv, fmt) => {
  fmt = __tostring(fmt);
  if (__isdate(dv)) {
    // assemble date string
    var sb = "";
    for (var i = 0; i < fmt.length; i++) {
      var pad = 0;
      switch (fmt[i]) {
        case 'D':
          pad = 2;
        case 'd':
          sb += this.padleft([dv.getDate(), pad, '0']);
          break;

        case 'e':
          sb += dv.toLocaleString([], { weekday: 'short' });
          break;
        case 'w':
          sb += dv.toLocaleString([], { weekday: 'long' });
          break;

        case 'M':
          pad = 2;
        case 'm':
          sb += this.padleft([dv.getMonth() + 1, pad, '0']);
          break;

        case 't':
          sb += dv.toLocaleString([], { month: 'short' });
          break;
        case 'u':
          sb += dv.toLocaleString([], { month: 'long' });
          break;

        case 'Y':
          sb += this.padleft([dv.getFullYear(), 4, '0']);
          break;
        case 'y':
          pad = 2;
          sb += this.padleft([dv.getYear() % 100, 2, '0']);
          break;

        case 'H':
          pad = 2;
        case 'h': {
          var h = dv.getHours() % 12;
          if (h == 0)
            h = 12;
          sb += this.padleft([h, pad, '0']);
          break;
        }
        case 'N':
          pad = 2;
        case 'n':
          sb += this.padleft([dv.getMinutes(), pad, '0']);
          break;

        case 'S':
          pad = 2;
        case 's':
          sb += this.padleft([dv.getSeconds(), pad, '0']);
          break;

        case 'F':
          pad = 3;
        case 'f':
          sb += this.padleft([dv.getMilliseconds(), pad, '0']);
          break;

        case 'I':
          pad = 2;
        case 'i':
          sb += this.padleft([dv.getHours(), pad, '0']);
          break;

        case 'a':
          if (dv.getHours() >= 12)
            sb += "pm";
          else
            sb += "am";
          break;
        case 'A':
          if (dv.getHours() >= 12)
            sb += "PM";
          else
            sb += "AM";
          break;

        case 'g':
          sb += "ad";
          break;
        case 'G':
          sb += "AD";
          break;

        case '%':
          if (i < fmt.length)
            sb += fmt[++i];
          break;

        default:
          sb += fmt[i];
          break;
      }
    }
  }
  return sb;
})


this.ops['tofixed'] = this.Binary((n, digits) => {
  n = __tonum(n);
  digits = __tonum(digits);
  if (__isnumber(n) && __isnumber(digits))
    return n.toFixed(digits);
})



func.def({ name: "date", body: $date });


