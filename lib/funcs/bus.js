//
// event observer and bus
//

const util = require("../core/util.js"),
      ea = require("../core/ea.js"),
      func = require("../core/func.js"),
      scopes = require("../core/scopes.js");


var observers = [];

async function $on_event (args, scope) {
    const opts = await scopes.destructure("filter observer &name", args, scope);
    opts.scope = scope;
    observers.push(opts);
}

async function $emit (args, scope) {
    for (var obs of observers) {
        var test = util.tobool(await ea.apply(obs.filter, args, scope));
        if (test)
            ea.apply(obs.observer, args, scope);
    }
}

function $drop_event (args, scope) {
    const name = util.tostring(args[0]);
    observers = observers.filter(function(e) { return e.name !== name });
}


func.def({ name: "on-event", body: $on_event });
func.def({ name: "drop-event", body: $drop_event });
func.def({ name: "emit", body: $emit });
