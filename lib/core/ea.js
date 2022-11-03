//
// eval-apply loop
//


module.exports = {};


const parser = require("./parser.js"),
      util = require("./util.js"),
      scopes = require("./scopes.js");



var dbg = false,
    depth = 0,
    spaces = "                                                                                ";

function log(action, ...args) {
    var out = (depth < 10 ? ' ' : '') + depth + spaces.substr(0, depth * 2 + 1) + action + " ";
    for(const arg of args) {
        if (util.isfunc(arg))
            out += "(fun " + arg.name + ") ";
        else 
            out += util.form_to_str(arg) + " ";
    }
    console.log(out);
}


function $dbg(args, scope) {
    dbg = util.tobool(args[0]);
}


// apply a function to a list of arguments
async function apply(f, args, scope) {
    scope = scope || scopes.global;
    if (util.isstring(f) || util.issymbol(f))
        f = scope.getinchain(f);

    if (dbg)
        log("apply>", f.name, args);
    depth++;
    var rs = null;
    if (util.isfunc(f)) {
        if (!f.sform) {
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (util.issymbol(arg) && arg.symbol.length && arg.symbol[0] == '&') {
                    // this is a label, so just leave it alone
                } else {
                    args[i] = await seval(args[i], scope);
                }
            }
        }
        rs = await f.call(args, scope);
    }
    depth--;
    if (dbg)
        log("apply<", f.name, rs);
    return rs;
}


// eval a tree sexpr
async function seval(sexpr, scope) {
    if (dbg)
        log("eval>", sexpr);
    depth++;
    var rs = sexpr;
    scope = scope || scopes.global;
    if (util.islist(sexpr) && sexpr.length > 0) {
        var first = await seval(sexpr[0], scope);
        if (util.isfunc(first)) {
            rs = await apply(first, sexpr.slice(1), scope);
        } else {
            // return a literal list
            // this might be a little off the standard
            // maybe a list form that is not a function should be an error
            rs = [first];
            for (var i = 1; i < sexpr.length; i++)
                rs.push(await seval(sexpr[i], scope));
        }
    } else if (util.issymbol(sexpr)) {
        rs = scope.getinchain(sexpr);
    }
    depth--;
    if (dbg)
        log("eval<", rs);
    return rs;
}


// parse and eval a string sexpr
async function streval(text, scope) {
    scope = scope || scopes.global;
    var sexpr = parser.parse(text);
    return await seval(sexpr, scope);
}


// there is a need for synchronous eval/apply in cases where
// JavaScript functions are not promise-ready. For example,
// the callback function to sort a table (in console.js) will
// not accept a promise.
function apply_sync(f, args, scope) {
    return null;
}


function seval_sync(sexpr, scope) {
    return null;
}


function streval_sync(text, scope) {
    return null;
}



// apply and eval are also surfaced as Lisp built-in functions
async function $apply(args, scope) {
    return await apply(args[0], args.slice(1), scope);
}

async function $eval(args, scope) {
    return await seval(args, scope);
}


module.exports.apply = apply;
module.exports.apply_sync = apply_sync;
module.exports.eval = seval;
module.exports.eval_sync = seval_sync;
module.exports.streval = streval;
module.exports.streval_sync = streval_sync;
module.exports.$dbg = $dbg;
module.exports.$apply = $apply;
module.exports.$eval = $eval;

