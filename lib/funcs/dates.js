//
// basic date/time operaitions
//

const func = require("../core/func.js"),
      util = require("../core/util.js");


// todo: deep comparisons of structs

function $now(args, scope) {
    return new Date();
}


function $date_in_s(args, scope) {
    return args[0].getTime() / 1000;
}


function $date_in_ms(args, scope) {
    return args[0].getTime();
}


function $date_from_s(args, scope) {
    return new Date(args[0] * 1000);
}


function $date_from_ms(args, scope) {
    return new Date(args[0]);
}



function $gmt_date(args, scope) {
    var dv = args[0];
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
}


function $local_date(args, scope) {
    var dv = args[0];
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
}


function padleft(s, len) {
    s = "" + s;
    while (s.length < len)
        s = "0" + s;
    return s;
}


function format_date (dv, fmt) {
  if (util.isdate(dv)) {
    var sb = "";
    for (var i = 0; i < fmt.length; i++) {
      var pad = 0;
      switch (fmt[i]) {
        case 'D': pad = 2;
        case 'd': sb += padleft(dv.getDate(), pad);
            break;
        case 'e': sb += dv.toLocaleString([], { weekday: 'short' });
            break;
        case 'w': sb += dv.toLocaleString([], { weekday: 'long' });
            break;
        case 'M': pad = 2;
        case 'm': sb += padleft(dv.getMonth() + 1, pad);
            break;
        case 't': sb += dv.toLocaleString([], { month: 'short' });
            break;
        case 'u': sb += dv.toLocaleString([], { month: 'long' });
            break;
        case 'Y': sb += padleft(dv.getFullYear(), 4);
            break;
        case 'y': pad = 2; sb += padleft(dv.getYear() % 100, 2);
            break;
        case 'H': pad = 2;
        case 'h': {
              var h = dv.getHours() % 12;
              if (h == 0)
                h = 12;
              sb += padleft(h, pad);
              break;
        }
        case 'N': pad = 2;
        case 'n': sb += padleft(dv.getMinutes(), pad);
          break;
        case 'S': pad = 2;
        case 's': sb += padleft(dv.getSeconds(), pad);
          break;
        case 'F': pad = 3;
        case 'f': sb += padleft(dv.getMilliseconds(), pad);
          break;
        case 'I': pad = 2;
        case 'i': sb += padleft(dv.getHours(), pad);
          break;
        case 'a': sb += (dv.getHours() >= 12) ? "pm" : "am";
          break;
        case 'A': sb += (dv.getHours() >= 12) ? "PM" : "AM";
          break;
        case 'g': sb += "ad";
          break;
        case 'G': sb += "AD";
          break;
        case '%': if (i < fmt.length) sb += fmt[++i];
          break;
        default: sb += fmt[i];
          break;
      }
    }
  }
  return sb;
}



func.def({ name: "now", body: $now, docs: "(now): Return the current date-time as a Date object" });
func.def({ name: "date-in-s", body: $date_in_s, docs: "(date-in-s date): Convert a date object to Epoch time in seconds" });
func.def({ name: "date-in-ms", body: $date_in_ms, docs: "(date-in-ms date): Convert a date object to Epoch time in milliseconds" });
func.def({ name: "date-from-s", body: $date_from_s, docs: "()" });
func.def({ name: "date-from-ms", body: $date_from_ms, docs: "()" });
func.def({ name: "gmt-date", body: $gmt_date, docs: "()" });
func.def({ name: "local-date", body: $local_date, docs: "()" });
func.def({ name: "format-date", body: func.binary(format_date), docs: "()" });


