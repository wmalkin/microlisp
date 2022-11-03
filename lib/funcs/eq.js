//
// tests and boolean logic
//


module.exports = {};


const func = require("../core/func.js"),
      ea = require("../core/ea.js"),
      util = require("../core/util.js");


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


async function $and(args, scope) {
    var stilltrue = true,
        i = 0;
    while (stilltrue && i < args.length) {
        if (util.isfalsy (await ea.eval(args[i], scope)))
            stilltrue = false;
        i++;
    }
    return stilltrue;
}


async function $or(args, scope) {
    var stillfalse = true,
        i = 0;
    while (stillfalse && i < args.length) {
        if (util.istruthy (await ea.eval(args[i], scope)))
            stillfalse = false;
        i++;
    }
    return !stillfalse;
}


function $not(args, scope) {
    return !util.istruthy(args[0]);
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


