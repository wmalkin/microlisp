//
// eval-apply loop
//


const parser = require("./parser.js"),
      util = require("./util.js"),
      scopes = require("./scopes.js");


var dbg = false,
    dbg_symlookups = true,
    dbg_scope = false,
    dbg_macroexpand = false,
    depth = 0,
    spaces = "                                                                                ";


function log(action, ...args) {
    var out = (depth < 10 ? ' ' : '') + depth + spaces.substr(0, depth * 2 + 1) + action + " ";
    for(const arg of args) {
        if (util.isfunc(arg))
            out += "(fun " + arg.name + ") ";
        else 
            out += util.tolisp(arg) + " ";
    }
    console.log(out);
}


async function $dbg(args, scope) {
    const opts = await scopes.destructure("dbg &sym &scope &macroexpand", args, scope);
    dbg = util.tobool(opts.dbg);
    dbg_symlookups = util.tobool(opts.sym);
    dbg_scope = util.tobool(opts.scope);
    dbg_macroexpand = util.tobool(opts.macroexpand);
}


// debug functions factored out
function dbg_pre_apply(f, args) {
    if (dbg)
        log("apply>", f.name, args);
    depth++;
}

function dbg_post_apply(f, rs) {
    depth--;
    if (dbg)
        log("apply<", f.name, rs);
}

function dbg_pre_eval(sexpr) {
    if (dbg) {
        if (!util.issymbol(sexpr))
            log("eval>", sexpr);
    }
    depth++;
}

function dbg_post_eval(sexpr, rs, scope) {
    depth--;
    if (dbg) {
        if (util.issymbol(sexpr)) {
            if (dbg_symlookups)
                log("eval(" + util.tostring(sexpr) + "): ", rs);
        } else {
            log("eval<", rs);
        }
        if (dbg_scope)
            if (scope.name == "global")
                log("scope global", Object.keys(scope.vars));
            else
                log("scope " + scope.name, scope.vars);
    }
}




// Evaluate a list of function arguments, and return the (possibly)
// evaluated results. Arguments are evaluated UNLESS the caller
// indicates the function is a special form, EXCEPT ALWAYS if
// an argument is preceded by a comma symbol.
async function eval_args(args, scope, sform) {
    var sym_comma = util.sym(',');
    var eargs;


    // unpack values at a symbol
    async function unpack(sym) {
        // Evaluate symbol and unpack in place
        sym = util.sym(sym.symbol.substr(1));
        var v = await seval(sym, scope);
        if (util.isdict(v)) {
            for (var nv of Object.entries(v)) {
                eargs.push (util.sym('&' + nv[0]));
                eargs.push(nv[1]);
            }
        } else if (util.islist(v)) {
            for (var i = 0; i < v.length; i++)
                eargs.push(v[i]);
        } else {
            eargs.push(v);
        }
    }


    eargs = [];
    for (var i = 0; i < args.length; i++) {
        var arg = args[i],
            comma_escape = false;
        if (arg == sym_comma && i < (args.length-1)) {
            comma_escape = true;
            i++;
            arg = args[i];
        }
        var sigil = (util.issymbol(arg) && arg.symbol.length) ? arg.symbol[0] : null;
        switch (sigil) {
            case '&':
                eargs.push(arg);
                break;
            case '*':
                if (sform && !comma_escape)
                    eargs.push(arg);
                else
                    await unpack(arg);
                break;
            default:
                if (sform && !comma_escape)
                    eargs.push(arg);
                else
                    eargs.push(await seval(arg, scope));
                break;
        }
    }
    return eargs;
}


// apply a function to a list of arguments
async function apply(f, args, scope) {
    scope = scope || scopes.global;
    if (util.isstring(f) || util.issymbol(f))
        f = scope.getinchain(f);
    dbg_pre_apply(f, args);
    var rs = null;
    if (util.isfunc(f)) {
        var eargs = await eval_args(args, scope, f.sform);
        rs = await f.call(eargs, scope);
    }
    dbg_post_apply(f, rs);
    return rs;
}


async function macroexpand(sexpr, scope) {
    var rs = {
        sexpr: sexpr,
        func: null,
        args: null
    }
    var cycle = true;
    while (cycle) {
        cycle = false;
        if (sexpr.length) {
            var first = await seval(rs.sexpr[0], scope);
            if (util.isfunc(first)) {
                rs.func = first;
                rs.args = rs.sexpr.slice(1);
                if (rs.func.macro) {
                    var eargs = await eval_args(rs.args, scope, rs.func.sform);
                    rs.sexpr = await rs.func.call(eargs, scope);
                    if (dbg_macroexpand) {
                        log("macro>", sexpr);
                        log("expansion>", rs.sexpr);
                    }
                    rs.func = null;
                    rs.args = null;
                    cycle = true;
                }
            }
        }
    }
    return rs;
}


async function $macroexpand(args, scope) {
    var exp = await macroexpand(args[0], scope);
    return exp.sexpr;
}


// eval a tree sexpr
async function seval(sexpr, scope) {
    dbg_pre_eval(sexpr);
    var rs = sexpr;
    scope = scope || scopes.global;
    if (util.islist(sexpr) && sexpr.length > 0) {
        var ex = await macroexpand(sexpr, scope);
        if (ex.func) {
            // var eargs = await eval_args(ex.args, scope, ex.func.sform);
            rs = await apply(ex.func, ex.args, scope);
        } else {
            // return a literal list
            // this might be a little off the standard
            // maybe a list form that is not a function should be an error
            rs = [];
            for (var i = 0; i < sexpr.length; i++)
                rs.push(await seval(sexpr[i], scope));
        }
    } else if (util.issymbol(sexpr)) {
        rs = scope.getinchain(sexpr);
    }
    dbg_post_eval(sexpr, rs, scope);
    return rs;
}


// parse and eval a string sexpr
async function streval(text, scope) {
    scope = scope || scopes.global;
    var sexpr = parser.parse(text);
    return await seval(sexpr, scope);
}


// apply and eval are also surfaced as Lisp built-in functions
async function $apply(args, scope) {
    return await apply(args[0], args.slice(1), scope);
}


async function $eval(args, scope) {
    return await seval(args[0], scope);
}


exports.apply = apply;
exports.eval = seval;
exports.streval = streval;

exports.$dbg = $dbg;
exports.$apply = $apply;
exports.$eval = $eval;
exports.$macroexpand = $macroexpand;
