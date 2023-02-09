//
// Lisp functions to wrap millisecond timers
//

const func = require("../core/func.js"),
      util = require("../core/util.js");
      ea = require("../core/ea.js");


async function $wait(args, scope) {
    var ms = util.tonum(args[0]);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(null);
        }, ms);
    });
}


async function $timeout(args, scope) {
    const ms = util.tonum(await ea.eval(args[0], scope)),
          forms = args.slice(1);
    setTimeout(() => {
        ea.apply("progn", forms, scope);
    }, ms);
}


async function $interval(args, scope) {
    const ms = util.tonum(await ea.eval(args[0], scope)),
          forms = args.slice(1);
    var interval = setInterval(async () => {
        var rs = await ea.apply("progn", forms);
        if (rs == false)
            clearInterval(interval);
    }, ms);
}


func.def({ name: "wait", body: $wait, async: true })
func.def({ name: "timer.timeout", body: $timeout, sform: true });
func.def({ name: "timer.interval", body: $interval, sform: true });

