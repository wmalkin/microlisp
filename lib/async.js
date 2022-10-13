//
// asynchronous operators
//


module.exports = {};

const func = require("../func.js");


async function $wait(args, scope) {
    var ms = util.tonum(args[0]);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(null);
        }, ms);
    });
}


func.def({ name: "wait", body: $wait, async: true })

