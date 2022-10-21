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
    this.inline = !!opts.inline || (opts.bindings == null && this.type == BODY_JAVASCRIPT);
    this.sform = !!opts.sform || !!opts.macro;
    this.macro = !!opts.macro;



    // callingScope is the scope of the calling function body, so macro
    // output and inline functions can be evaluated as if they were
    // inlined in the calling function body
    this.call = async function(args, callingScope) {
        var rs = null;
        var thisscope = this.inline ? callingScope : (this.scope || scopes.global);
        if (this.bindings) {
            thisscope = scopes.create(thisscope, this.name + " activation");
            await thisscope.bind(this.bindings, args, false);
        }
        switch (this.type) {
            case BODY_SEXPR:
                rs = await ea.eval_sexpr(this.body, thisscope);
                break;
            case BODY_JAVASCRIPT:
                rs = await this.body(args, thisscope);
                break;
        }
        if (this.macro)
            rs = await ea.eval_sexpr(rs, callingScope);
        return rs;
    }
}


function def(opts) {
    scopes.global.let(opts.name, new FUNC(opts));
}


module.exports.FUNC = FUNC;
module.exports.def = def;

