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
  this.call = function(args, context) {
    var rs = null;
    switch (this.type) {
      case BODY_SEXPR:
        if (this.bindings) {
          // create a local scope and bind in args; then eval body in that scope
          var s = scopes.create(this.scope);
          s.$bind(this.bindings, args, false);
          rs = ea.eval_sexpr(this.body, s);
        } else {
          // eval body in the scope (closure) for this function
          rs = ea.eval_sexpr(this.body, this.scope);
        }
        break;
      case BODY_JAVASCRIPT:
        // call a javascript body
        rs = this.body(args, context);
        break;
    }
    if (this.macro)
      rs = ea.eval_sexpr(rs, context);
    return rs;
  }


  this.name = opts.name;
  this.docs = opts.docs;
  this.bindings = opts.bindings;
  this.body = opts.body;
  this.scope = opts.scope || scopes.global;

  if (util.islist(this.body))
    this.type = BODY_SEXPR;
  else if (util.isjsfunc(this.body))
    this.type = BODY_JAVASCRIPT;
  else
    this.type = BODY_UNKNOWN;

  this.sform = !!opts.sform || !!opts.macro;
  this.macro = !!opts.macro;
}


function create(opts) {
  return new FUNC(opts);
}


function def(opts) {
  scopes.global.$let(opts.name, create(opts));
}



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
  options.scope = scope;
  return options;
}



function $fun(args, scope) {
  var options = FUNC_OPERANDS(args, scope);
  return create(options);
}


function $defun(args, scope) {
  var options = FUNC_OPERANDS(args, scope);
  var f = create(options, scope);
  if (options.name != "__anonymous")
    scopes.global.$let(options.name, f);
  return f;
}

function $defmacro(args, scope) {
  var options = FUNC_OPERANDS(args, scope);
  options.macro = true;
  var f = create(options, scope);
  if (options.name != "__anonymous")
    scopes.global.$let(options.name, f);
  return f;
}


function init() {
  // define builtin functions: (fun), (defun), (defmacro)
  def({ name: "fun", body: $fun, sform: true });
  def({ name: "defun", body: $defun, sform: true });
  def({ name: "defmacro", body: $defmacro, sform: true });
}



module.exports.init = init;
module.exports.FUNC = FUNC;
module.exports.create = create;
module.exports.def = def;

