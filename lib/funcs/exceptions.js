//
// basic exceptions
//

const util = require("../core/util.js"),
      func = require("../core/func.js"),
      ea = require("../core/ea.js");


var gexcept = null,
    handlers = [];


var handler = null;

// process.on('unhandledRejection', async (error) => {
//     if (handler)
//         await ea.apply(handler, [error]);
//     else
//         console.log('unhandled exception', error.test);
// });


async function $catch(args, scope) {
    (async function () {
        handler = await ea.eval(args[0], scope);
        rs = await ea.eval(args[1], scope);
        handler = null;
    })().catch(ex => {
        console.log("error");
    })
}


func.def({ name: "catch", body: $catch, sform: true });

