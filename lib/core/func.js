//
// function object
//


const util = require("./util.js"),
      scopes = require("./scopes.js"),
      ea = require("./ea.js");

const BODY_UNKNOWN = 'unknown',
      BODY_SEXPR = 'sexpr',
      BODY_JAVASCRIPT = 'js';


function FUNC(opts) {
    this.name = opts.name;
    this.docs = opts.docs;
    this.bindings = opts.bindings;
    this.body = opts.body;
    this.scope = opts.scope;
    if (util.isjsfunc(this.body))
        this.type = BODY_JAVASCRIPT;
    else
        this.type = BODY_SEXPR;
    this.inline = !!opts.inline || (opts.bindings == null && this.type == BODY_JAVASCRIPT);
    this.sform = !!opts.sform;
    this.macro = !!opts.macro;



    // callingScope is the scope of the calling function body, so macro
    // output and inline functions can be evaluated as if they were
    // inlined in the calling function body
    this.call = async function(args, callingScope) {
        var rs = null;
        var thisscope = this.inline ? callingScope : (this.scope || scopes.global);
        if (this.bindings) {
            thisscope = scopes.create(thisscope, this.name + " activation");
            await thisscope.bind(this.bindings, args, this.sform);
        }
        switch (this.type) {
            case BODY_SEXPR:
                rs = await ea.eval(this.body, thisscope);
                break;
            case BODY_JAVASCRIPT:
                rs = await this.body(args, thisscope);
                break;
        }
        if (this.macro)
            rs = await ea.eval(rs, callingScope);
        return rs;
    }
}


function def(opts) {
    scopes.global.def(opts.name, new FUNC(opts));
}


function $func_name (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].name;
    return null;
}


function $func_docs (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].docs;
    return null;
}


function $func_bindings (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].bindings;
    return null;
}


function $func_body (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].body;
    return null;
}


function $func_type (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].type;
    return null;
}


function $func_closurep (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].scope != null;
    return null;
}


function $func_inlinep (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].inline;
    return null;
}


function $func_sformp (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].sform;
    return null;
}


function $func_macrop (args, scope) {
    if (util.isfunc(args[0]))
        return args[0].macro;
    return null;
}


function constant (f) {
    return (args, scope) => {
        return f(scope);
    }
}


function unary (f) {
    return (args, scope) => {
        if (args.length >= 1)
            return f(args[0], scope);
        return null;
    }
}


function binary (f) {
    return (args, scope) => {
        if (args.length >= 2)
            return f(args[0], args[1], scope);
        return null;
    }
}


function trinary (f) {
    return (args, scope) => {
        if (args.length >= 3)
            return f(args[0], args[1], args[2], scope);
        return null;
    }
}


exports.$func_name = $func_name;
exports.$func_docs = $func_docs;
exports.$func_bindings = $func_bindings;
exports.$func_body = $func_body;
exports.$func_type = $func_type;
exports.$func_closurep = $func_closurep;
exports.$func_inlinep = $func_inlinep;
exports.$func_sformp = $func_sformp;
exports.$func_macrop = $func_macrop;

exports.FUNC = FUNC;
exports.def = def;

exports.constant = constant;
exports.unary = unary;
exports.binary = binary;
exports.trinary = trinary;

