//
// function object
//


module.exports = {};


const util = require("./util.js"),
      scopes = require("./scopes.js"),
      ea = require("./ea.js");


const BODY_UNKNOWN = 'unknown',
      BODY_SEXPR = 'sexpr',
      BODY_JAVASCRIPT = 'js';


function FUNC(opts) {
    

    this.issform = function() {
        return this.sform;
    }


    this.ismacro = function() {
        return this.macro;
    }


    // context is the scope of the calling function body, so macro
    // output can be evaluated in that scope
    this.call = async function(args, context) {
        var rs = null;
        // console.log("call", this.name, " in scope:", context.name);
        switch (this.type) {
            case BODY_SEXPR:
                if (this.bindings) {
                    // create a local scope and bind in args; then eval body in that scope
                    var s = scopes.create(this.scope || scopes.global, this.name + " activation");
                    await s.$bind(this.bindings, args, false);
                    rs = await ea.eval_sexpr(this.body, s);
                } else {
                    // eval body in the scope (closure) for this function
                    rs = await ea.eval_sexpr(this.body, this.scope || scopes.global);
                }
                break;
            case BODY_JAVASCRIPT:
                // call a javascript body
                rs = await this.body(args, context);
                break;
        }
        if (this.macro)
            rs = await ea.eval_sexpr(rs, context);
        return rs;
    }


    this.name = opts.name;
    this.docs = opts.docs;
    this.bindings = opts.bindings;
    this.body = opts.body;
    this.scope = opts.scope;

    if (util.islist(this.body))
        this.type = BODY_SEXPR;
    else if (util.isjsfunc(this.body))
        this.type = BODY_JAVASCRIPT;
    else
        this.type = BODY_UNKNOWN;

    this.sform = !!opts.sform || !!opts.macro;
    this.macro = !!opts.macro;
}


function def(opts) {
    scopes.global.$let(opts.name, new FUNC(opts));
}


module.exports.FUNC = FUNC;
module.exports.def = def;

