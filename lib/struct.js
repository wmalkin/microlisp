//
// data structure manipulation functions
//

module.exports = {};

const func = require("../func.js"),
      paths = require("../paths.js"),
      util = require("../util.js"),
      ea = require("../ea.js");


function $list(args, scope) {
    return args;
}


async function $dict(args, scope) {
    var rs = {},
        i = 0;
    while (i < (args.length-1)) {
        rs[util.tostring(args[i])] = await ea.eval_sexpr(args[i+1], scope);
        i += 2;
    }
    return rs;
}


function $get(args, scope) {
    var container = args[0],
        path = util.tostring(args[1]),
        rsym = paths.__resolveInContainer(path, container);
    return rsym.value;
}


function $put(args, scope) {
    var container = args[0],
        path = util.tostring(args[1]),
        val = args[2],
        rsym = paths.__resolveInContainer(path, container);
    paths.__putIntoContainer(rsym, val);
    return val;
}



function expand(args, depthLimit) {
    var exops = [];
    for (var i = 0; i < args.length; i++)
        if (util.islist(args[i]) && (depthLimit == null || depthLimit > 0))
            exops = exops.concat(expand(args[i], depthLimit == null ? null : (depthLimit > 1 ? depthLimit - 1 : 0)));
        else
            exops.push(args[i]);
    return exops;
}


function $explode(args, scope) {
    return expand(args);
}


function $explode1(args, scope) {
    return expand(args, 2);
}


function $explode2(args) {
    return expand(args, 3);
}


function $append(args, scope) {
    var exops = [];
    for (var i = 0; i < args.length; i++)
        if (util.islist(args[i]))
            exops = exops.concat(args[i]);
        else
            exops.push(args[i]);
    return exops;
}



function $first(args, scope) {
    if (args.length && util.islist(args[0]) && args[0].length)
        return args[0][0];
    return null;
}


function $last(args, scope) {
    if (args.length && util.islist(args[0]) && args[0].length)
        return args[0][args[0].length-1];
    return null;
}


function $rest(args, scope) {
    if (args.length && util.islist(args[0]))
        return args[0].slice(1);
    return null;
}


function $prune(args, scope) {
    if (args.length && util.islist(args[0]))
        return args[0].slice(0, args[0].length-1);
    return null;
}


function $slice(args, scope) {
    return args[0].slice(...args.slice(1));
}


function $splice(args, scope) {
    return args[0].splice(...args.slice(1));
}


function $count(args, scope) {
    var v = args[0];
    if (util.isstring(v) || util.islist(v))
        return v.length;
    return null;
}


function $keys(args, scope) {
    if (util.isdict(args[0]))
        return Object.keys(args[0]);
}


function $seq(args, scope) {
    var start = 0,
            end = 0,
            inc = 1;
    if (args.length == 1) {
        end = util.tonum(args[0]);
    } else if (args.length > 1) {
        start = util.tonum(args[0]);
        end = util.tonum(args[1]);
        if (args.length > 2)
            inc = util.tonum(args[2]);
    }
    var rs = [];
    for (var i = start; i <= end; i += inc)
        rs.push(i);
    return rs;
}


function $fill(args, scope) {
    var rs = [],
            n = util.tonum(args[0]),
            v = args[1];
    for (var i = 0; i < n; i++)
        rs.push(v);
    return rs;
}


function $pop(args, scope) {
    if (args.length && util.islist(args[0]) && args[0].length)
        return args[0].shift();
    return null;
}


function $push(args, scope) {
    if (args.length == 2 && util.islist(args[0])) {
        args[0].splice(0, 0, args[1]);
        return args[0];
    }
    return null;
}


function $cliphead(args, scope) {
    return args[0].slice(Math.max(0, args[0].length - util.tonum(args[1])));
}


function $cliptail(args, scope) {
    return args[0].slice(0, util.tonum(args[1]));
}



func.def({ name: "list", body: $list });
func.def({ name: "dict", body: $dict, sform: true });
func.def({ name: "get", body: $get });
func.def({ name: "put", body: $put });
func.def({ name: "explode", body: $explode });
func.def({ name: "explode1", body: $explode1 });
func.def({ name: "explode2", body: $explode2 });
func.def({ name: "append", body: $append });

func.def({ name: "first", body: $first });
func.def({ name: "last", body: $last });
func.def({ name: "rest", body: $rest });
func.def({ name: "prune", body: $prune });
func.def({ name: "slice", body: $slice });
func.def({ name: "splice", body: $splice });
func.def({ name: "count", body: $count });
func.def({ name: "keys", body: $keys });
func.def({ name: "seq", body: $seq });
func.def({ name: "fill", body: $fill });
func.def({ name: "pop", body: $pop });
func.def({ name: "push", body: $push });
func.def({ name: "cliphead", body: $cliphead });
func.def({ name: "cliptail", body: $cliptail });

