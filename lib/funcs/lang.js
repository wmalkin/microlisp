//
// built-in functions
//

const scopes = require("../core/scopes.js"),
      ea = require("../core/ea.js"),
      func = require("../core/func.js"),
      util = require("../core/util.js"),
      paths = require("../core/paths.js");

const _util = require("util");


async function each_binding(args, scope, f) {
    var i = 0, rs = null;
    while (i < (args.length-1)) {
        rs = await ea.eval(args[i+1], scope);
        f(args[i], rs, scope);
        i += 2;
    }
    return rs;
}


async function $defvar(args, scope) {
    return await each_binding(args, scope, (sym, value, scope) => {
        scopes.global.def(sym, value);
    })
}


async function $setq(args, scope) {
    return await each_binding(args, scope, (sym, value, scope) => {
        scope.let(sym, value, false);
    })
}


async function $local(args, scope) {
    return await each_binding(args, scope, (sym, value, scope) => {
        scope.def(sym, value);
    })
}


async function $progn(args, scope) {
    var rs = null;
    for (var i = 0; i < args.length; i++)
        rs = await ea.eval(args[i], scope);
    return rs;
}


async function $with(args, scope) {
    var withscope = scopes.create(scope, "with");
    await $local(args[0], withscope);
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


function $insp(args, scope) {
    var rs = [];
    for (var i in args)
        console.log(_util.inspect(args[i], {depth:null, colors:true, compact:false}));
    return null;
}


function $gscope(args, scope) {
    return scopes.global.vars;
}


function $scope(args, scope) {
    return scope.vars;
}



func.def({ name: "quote", body: $quote, sform: true });
func.def({ name: "progn", body: $progn, sform: true });
func.def({ name: "prt", body: $prt });
func.def({ name: "insp", body: $insp });
func.def({ name: "gscope", body: $gscope });
func.def({ name: "scope", body: $scope });
func.def({ name: "defvar", body: $defvar, sform: true });
func.def({ name: "setq", body: $setq, sform: true });
func.def({ name: "let", body: $with, sform: true });
func.def({ name: "local", body: $local, sform: true });


