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


// evaluate arguments and process splices
async function eval_and_splice(form, scope, sform) {
    var rs = [];
    var i = 0;
    while (i < form.length) {
        var expr = form[i],
            splice = false;
        if (util.issymbol(expr) && expr.symbol.length && expr.symbol[0] == '@') {
            splice = true;
            expr = util.sym(expr.symbol.substr(1));
        }

        if (splice || !sform)
            expr = await eval_sexpr(expr, scope);

        if (splice && util.islist(expr)) {
            rs = rs.concat(expr);
        } else if (splice && util.isdict(expr)) {
            Object.entries(expr).forEach(itm => {
                rs.push(util.sym('&' + itm[0]));
                rs.push(itm[1]);
            })
        } else if (!splice || !util.isnull(expr)) {
            rs.push(expr);
        }
        i++;
    }
    return rs;
}


// process commas, splices, and comma-splices in argument list
// async function eval_and_splice(form, scope, sform) {
//     const sym_comma = util.sym(',');
//     var rs = [];
//     var i = 0;
//     var eval_this = false,
//         eval_next = false;
//     while (i < form.length) {
//         if (form[i] == sym_comma) {
//             eval_next = true;
//         } else if (!sform || eval_this) {
//             rs.push(await eval_sexpr(form[i], scope));
//         } else if (util.islist(form[i])) {
//             rs.push(await eval_and_splice(form[i], scope, sform));
//         } else {
//             rs.push(form[i]);
//         }
//         eval_this = eval_next;
//         eval_next = false;
//         i++;
//     }
//     return rs;
// }


// async function process_commas(form, scope, sform) {
//     const sym_comma = util.sym(',');
//     if (!util.islist(form))
//         return form;
//     var rs = [];
//     for (var i = 0; i < form.length; i++) {
//         if (form[i] == sym_comma) {
//             i++;
//             if (i < form.length)
//                 rs.push(await ea.eval_sexpr(form[i], scope));
//         } else {
//             rs.push(await process_commas(form[i], scope));
//         }
//     }
//     return rs;
// }


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
        args = await eval_and_splice(args, scope, f.sform);
        // if (!f.sform)
        //     for (var i = 0; i < args.length; i++)
        //         args[i] = await eval_sexpr(args[i], scope);
        rs = await f.call(args, scope);
    }
    depth--;
    if (dbg)
        log("apply<", f.name, rs);
    return rs;
}


async function $apply(args, scope) {
    return await apply(args[0], args.slice(1), scope);
}


// eval a tree sexpr
async function eval_sexpr(sexpr, scope) {
    if (dbg)
        log("eval>", sexpr);
    depth++;
    var rs = sexpr;
    scope = scope || scopes.global;
    if (util.islist(sexpr) && sexpr.length > 0) {
        var first = await eval_sexpr(sexpr[0], scope);
        if (util.isfunc(first))
            rs = await apply(first, sexpr.slice(1), scope);
        else {
            rs = [first];
            for (var i = 1; i < sexpr.length; i++)
                rs.push(await eval_sexpr(sexpr[i], scope));
        }
    } else if (util.issymbol(sexpr)) {
        rs = scope.getinchain(sexpr);
    }
    depth--;
    if (dbg)
        log("eval<", rs);
    return rs;
}


async function $eval(args, scope) {
    return await eval_sexpr(args, scope);
}


// parse and eval a string sexpr
async function eval_str(line, scope) {
    scope = scope || scopes.global;
    var sexpr = parser.parse(line);
    return await eval_sexpr(sexpr);
}


module.exports.apply = apply;
module.exports.eval_sexpr = eval_sexpr;
module.exports.eval_str = eval_str;
module.exports.$dbg = $dbg;
module.exports.$apply = $apply;
module.exports.$eval = $eval;

