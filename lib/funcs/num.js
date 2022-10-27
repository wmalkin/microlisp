//
// additional number operations
//

module.exports = {};

const func = require("../core/func.js"),
      util = require("../core/util.js");


function $tofixed(args, scope) {
    var n = util.tonum(args[0]),
        digits = util.tonum(args[1]);
    digits = util.tonum(digits);
    if (util.isnumber(n) && util.isnumber(digits))
        return n.toFixed(digits);
}


func.def({ name: "tofixed", body: $tofixed });

