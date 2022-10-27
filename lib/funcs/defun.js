//
// defining functions and macros
//


module.exports = {};


const scopes = require("../core/scopes.js"),
      util = require("../core/util.js"),
      func = require("../core/func.js");


// split a function into declaration, bindings, and body
// looks for the first list, which is expected to be bindings
function FUNC_SPLIT(args) {
    var firstList = 0;
    while (firstList < args.length && !util.islist(args[firstList]))
        firstList++;
    if (firstList == args.length) {
        return {
            declarations: null,
            bindings: null,
            body: null
        };
    } else {
        return {
            declarations: args.slice(0, firstList),
            bindings: args[firstList],
            body: args.slice(firstList+1, firstList.length)
        }
    }
}


// find and eat directives (symbols starting with &) in the declarations
// portion of a function
var FUNC_DIRECTIVES = function FUNC_DIRECTIVES(decls, options) {
    options.directives = [];
    var i = 0;
    while (i < decls.length) {
        if (util.issymbol(decls[i]) && decls[i].symbol[0] == '&') {
            var sym = decls.splice(i, 1);
            options.directives[sym.symbol.substr(1)] = true;
        } else {
            i++
        }
    }
}


// parse function args (to defun or fun or defmacro etc.)
// stores various parts of the function declaration in the options structure
function FUNC_OPERANDS(args, scope) {
    var options = {},
        parts = FUNC_SPLIT(args);
    if (parts.bindings == null) {
        console.log("Missing bindings in function declaration for " + parts.declarations[0] || '__anonymous');
    } else {
        FUNC_DIRECTIVES(parts.declarations, options);
        options.name = (parts.declarations.length > 0) ? util.tostring(parts.declarations[0]) : "__anonymous";
        options.docs = (parts.declarations.length > 1) ? util.tostring(parts.declarations[1]) : null;
    }
    if (options.docs == null && parts.body.length && util.isstring(parts.body[0])) {
        options.docs = parts.body.shift();
    }
    options.bindings = parts.bindings;
    if (parts.body.length == 1)
        options.body = parts.body[0];
    else {
        parts.body.unshift(util.sym("progn"));
        options.body = parts.body;
    }
    if (scope != scopes.global)
        options.scope = scope;
    return options;
}



function $fun(args, scope) {
    var options = FUNC_OPERANDS(args, scope);
    return new func.FUNC(options);
}


function $sform(args, scope) {
    var options = FUNC_OPERANDS(args, scope);
    options.sform = true;
    return new func.FUNC(options, scope);
}


function $macro(args, scope) {
    var options = FUNC_OPERANDS(args, scope);
    options.macro = true;
    return new func.FUNC(options, scope);
}


function $defun(args, scope) {
    var options = FUNC_OPERANDS(args, scope);
    var f = new func.FUNC(options, scope);
    if (options.name != "__anonymous")
        scopes.global.let(options.name, f);
    return f;
}


function $defmacro(args, scope) {
    var options = FUNC_OPERANDS(args, scope);
    options.macro = true;
    var f = new func.FUNC(options, scope);
    if (options.name != "__anonymous")
        scopes.global.let(options.name, f);
    return f;
}


function $defsform(args, scope) {
    var options = FUNC_OPERANDS(args, scope);
    options.sform = true;
    var f = new func.FUNC(options, scope);
    if (options.name != "__anonymous")
        scopes.global.let(options.name, f);
    return f;
}

func.def({ name: "func.name", body: func.$func_name });
func.def({ name: "func.docs", body: func.$func_docs });
func.def({ name: "func.bindings", body: func.$func_bindings });
func.def({ name: "func.body", body: func.$func_body });
func.def({ name: "func.closurep", body: func.$func_closurep });
func.def({ name: "func.inlinep", body: func.$func_inlinep });
func.def({ name: "func.sformp", body: func.$func_sformp });
func.def({ name: "func.macrop", body: func.$func_macrop });

func.def({ name: "fun", body: $fun, sform: true });
func.def({ name: "sform", body: $sform, sform: true });
func.def({ name: "macro", body: $macro, sform: true });
func.def({ name: "defun", body: $defun, sform: true });
func.def({ name: "defmacro", body: $defmacro, sform: true });
func.def({ name: "defsform", body: $defsform, sform: true });


