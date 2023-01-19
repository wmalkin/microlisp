//
// asynchronous operators
//


const func = require("../core/func.js"),
      util = require("../core/util.js");


async function $wait(args, scope) {
    var ms = util.tonum(args[0]);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(null);
        }, ms);
    });
}


func.def({ name: "wait", body: $wait, async: true })

