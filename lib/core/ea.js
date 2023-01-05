//
// eval-apply loop
//


module.exports = {};


const parser = require("./parser.js"),
      util = require("./util.js"),
      scopes = require("./scopes.js");



var dbg = false,
    dbg_symlookups = true,
    dbg_scope = true,
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


// debug functions factored out
function dbg_pre_apply(f, args) {
    if (dbg)
        log("apply>", f.name, args);
    depth++;
}

function dbg_post_apply() {
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



// apply a function to a list of arguments
async function apply(f, args, scope) {
    scope = scope || scopes.global;
    if (util.isstring(f) || util.issymbol(f))
        f = scope.getinchain(f);
    dbg_pre_apply(f, args);
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
    dbg_post_apply(f, rs);
    return rs;
}


// eval a tree sexpr
async function seval(sexpr, scope) {
    dbg_pre_eval(sexpr);
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
    dbg_post_eval(sexpr, rs, scope);
    return rs;
}


// parse and eval a string sexpr
async function streval(text, scope) {
    scope = scope || scopes.global;
    var sexpr = parser.parse(text);
    return await seval(sexpr, scope);
}


// // there is a need for synchronous eval/apply in cases where
// // JavaScript functions are not promise-ready. For example,
// // the callback function to sort a table (in console.js) will
// // not accept a promise.
// function apply_sync(f, args, scope) {
//     scope = scope || scopes.global;
//     if (util.isstring(f) || util.issymbol(f))
//         f = scope.getinchain(f);
//     dbg_pre_apply(f, args);
//     var rs = null;
//     if (util.isfunc(f)) {
//         if (!f.sform) {
//             for (var i = 0; i < args.length; i++) {
//                 var arg = args[i];
//                 if (util.issymbol(arg) && arg.symbol.length && arg.symbol[0] == '&') {
//                     // this is a label, so just leave it alone
//                 } else {
//                     args[i] = seval_sync(args[i], scope);
//                 }
//             }
//         }
//         rs = f.call_sync(args, scope);
//     }
//     dbg_post_apply(f, rs);
//     return rs;
// }


// function seval_sync(sexpr, scope) {
//     dbg_pre_eval(sexpr);
//     var rs = sexpr;
//     scope = scope || scopes.global;
//     if (util.islist(sexpr) && sexpr.length > 0) {
//         var first = seval_sync(sexpr[0], scope);
//         if (util.isfunc(first)) {
//             rs = apply_sync(first, sexpr.slice(1), scope);
//         } else {
//             // return a literal list
//             // this might be a little off the standard
//             // maybe a list form that is not a function should be an error
//             rs = [first];
//             for (var i = 1; i < sexpr.length; i++)
//                 rs.push(seval_sync(sexpr[i], scope));
//         }
//     } else if (util.issymbol(sexpr)) {
//         rs = scope.getinchain(sexpr);
//     }
//     dbg_post_eval(sexpr, rs, scope);
//     return rs;
// }


// function streval_sync(text, scope) {
//     scope = scope || scopes.global;
//     var sexpr = parser.parse(text);
//     return seval_sync(sexpr, scope);
// }



// apply and eval are also surfaced as Lisp built-in functions
async function $apply(args, scope) {
    return await apply(args[0], args.slice(1), scope);
}

async function $eval(args, scope) {
    return await seval(args, scope);
}



// async function iter_eval(sexpr, scope) {
//     var evalrs = null;


//     var poprs = function(rs) {
//         // pop a result into the correct slot of the previous state
//         stack.shift();
//         if (stack.length) {
//             var top = stack[0];
//             if (util.islist(top.expr)) {
//                 if (top.p == 0) {
//                     top.f = rs;
//                     top.args = [];
//                 } else {
//                     if (top.spliced)
//                         top.args = top.args.concat(rs);
//                     else
//                         top.args.push(rs);
//                 }
//                 top.p++;
//             }
//         } else {
//             evalrs = rs;
//         }
//     }


//     scope = scope || scopes.global;

//     var stack = [ { e:sexpr, p:0, s:scope } ];

//     var rs;
//     while (stack.length) {
//         rs = null;
//         var top = stack[0];
//         if (util.islist(top.expr)) {
//             if (top.p == 0) {
//                 // evaluate function object
//                 stack.push({expr:top.expr[0], p:0, s:top.s})
//             } else if (top.p > top.expr.length) {
//                 // apply function
//                 // make a new function activation scope
//                 var fas = s;
//                 if (f.bindings) {
//                     fas = scopes.create(s, f.name + " activation");
//                     fas.bind(f.bindings, args, f.sform);
//                 }
//                 if (f.type == 'sexpr')
//                     // replace function call form with body of function and continue
//                     stack[0] = { e:f.body, p:0, s:fas };
//                 else
//                     // call javascript body for result
//                     rs = await f.body(args, fas);
//             } else {
//                 // evaluate the next argument, unless special form
//                 if (top.f.sform)
//                     top.args.push(top.expr[top.p]);
//                 else
//                     stack.push({expr:top.expr[top.p], p:0, s:top.s});
//             }
//         } else if (util.issymbol(e)) {
//             rs = scope.getinchain(e);
//             stack.shift();
//             if (stack.length) {
//                 {e,p,s} = stack[0];
//                 e[p++] = rs;
//             }
//         } else {
//             rs = e;
//             stack.shift();
//             if (stack.length) {
//                 {e,p,s} = stack[0];
//                 e[p++] = rs;
//             }
//         }
//     }
// }

module.exports.apply = apply;
module.exports.eval = seval;
module.exports.streval = streval;
module.exports.$dbg = $dbg;
module.exports.$apply = $apply;
module.exports.$eval = $eval;

