//
// tests and boolean logic
//


module.exports = {};

const func = require("../func.js"),
      ea = require("../ea.js");


// todo: deep comparisons of structs

function $eq(args, scope) {
    if (args.length == 2)
        return args[0] == args[1];
    return null;
}


function $ne(args, scope) {
    if (args.length == 2)
        return args[0] != args[1];
    return null;
}


function $gt(args, scope) {
    if (args.length == 2)
        return args[0] > args[1];
    return null;
}


function $lt(args, scope) {
    if (args.length == 2)
        return args[0] < args[1];
    return null;
}


function $ge(args, scope) {
    if (args.length == 2)
        return args[0] >= args[1];
    return null;
}


function $le(args, scope) {
    if (args.length == 2)
        return args[0] <= args[1];
    return null;
}


function $in(args, scope) {
    return null;
}


function $nin(args, scope) {
    return null;
}


function $and(args, scope) {
    var stilltrue = true,
        i = 0;
    while (stilltrue && i < args.length) {
        if (util.isfalsy (ea.eval_sexpr(args[i]), scope))
            stilltrue = false;
        i++;
    }
    return stilltrue;
}


function $or(args, scope) {
    var stillfalse = true,
        i = 0;
    while (stillfalse && i < args.length) {
        if (util.istruthy (ea.eval_sexpr(args[i]), scope))
            stillfalse = false;
        i++;
    }
    return !stillfalse;
}


function $not(args, scope) {
    return !util.istruthy(ea.eval_sexpr(args[0], scope));
}



func.def({ name: "==", body: $eq });
func.def({ name: "!=", body: $ne });
func.def({ name: ">", body: $gt });
func.def({ name: "<", body: $lt });
func.def({ name: ">=", body: $ge });
func.def({ name: "<=", body: $le });
func.def({ name: "in", body: $in });
func.def({ name: "nin", body: $nin });

func.def({ name: "and", body: $and, sform: true });
func.def({ name: "or", body: $or, sform: true });
func.def({ name: "not", body: $not });


