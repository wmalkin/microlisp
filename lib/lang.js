//
// built-in functions
//

module.exports = {};


const scopes = require("../scopes.js"),
      ea = require("../ea.js"),
      func = require("../func.js"),
      util = require("../util.js"),
      paths = require("../paths.js");


async function $let(args, scope) {
    var i = 0;
    while (i < (args.length-1)) {
        scope.$let(args[i], await ea.eval_sexpr(args[i+1], scope), scope);
        i += 2;
    }
    return null;
}


async function $progn(args, scope) {
    var rs = null;
    for (var i = 0; i < args.length; i++)
        rs = await ea.eval_sexpr(args[i], scope);
    return rs;
}


function $quote(args, scope) {
    return args[0];
}


function $prt(args, scope) {
    for (var i in args)
        process.stdout.write(util.tolisp(args[i]) + " ");
    console.log();
    return null;
}


function $gscope(args, scope) {
    return scopes.global.vars;
}


func.def({ name: "let", body: $let, sform: true });
func.def({ name: "quote", body: $quote, sform: true });
func.def({ name: "progn", body: $progn, sform: true });
func.def({ name: "prt", body: $prt });
func.def({ name: "gscope", body: $gscope });

