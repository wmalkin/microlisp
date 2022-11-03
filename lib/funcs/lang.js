//
// built-in functions
//

module.exports = {};


const scopes = require("../core/scopes.js"),
      ea = require("../core/ea.js"),
      func = require("../core/func.js"),
      util = require("../core/util.js"),
      paths = require("../core/paths.js");


async function $let(args, scope) {
    var i = 0;
    while (i < (args.length-1)) {
        scope.let(args[i], await ea.eval(args[i+1], scope), scope);
        i += 2;
    }
    return null;
}


async function $progn(args, scope) {
    var rs = null;
    for (var i = 0; i < args.length; i++)
        rs = await ea.eval(args[i], scope);
    return rs;
}


async function $with(args, scope) {
    var withscope = scopes.create(scope, "with");
    await $let(args[0], withscope);
    return await $progn(args.slice(1), withscope);
}


async function process_commas(form, scope) {
    const sym_comma = util.sym(',');
    if (!util.islist(form))
        return form;
    var rs = [];
    for (var i = 0; i < form.length; i++) {
        if (form[i] == sym_comma) {
            i++;
            if (i < form.length)
                rs.push(await ea.eval(form[i], scope));
        } else {
            rs.push(await process_commas(form[i], scope));
        }
    }
    return rs;
}


async function $quote(args, scope) {
    var form = (args.length == 1) ? args[0] : args;
    form = await process_commas(form, scope);
    return form;
}


function $prt(args, scope) {
    var rs = [];
    for (var i in args)
        rs.push(util.tostring(args[i]));
    console.log(rs.join(' '));
    return null;
}


function $gscope(args, scope) {
    return scopes.global.vars;
}



func.def({ name: "let", body: $let, sform: true });
func.def({ name: "quote", body: $quote, sform: true });
func.def({ name: "progn", body: $progn, sform: true });
func.def({ name: "with", body: $with, sform: true });
func.def({ name: "prt", body: $prt });
func.def({ name: "gscope", body: $gscope });


