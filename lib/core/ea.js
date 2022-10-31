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


// splice an expr onto an existing list
// lists are joined to the existing list
// dicts are joined as &key,value pairs
// other non-null types are added to the existing list
// a null expression does not affect the list
function splice_join(tolist, expr) {
    if (util.islist(expr)) {
        tolist = tolist.concat(expr);
    } else if (util.isdict(expr)) {
        Object.entries(expr).forEach(itm => {
            tolist.push(util.sym('&' + itm[0]));
            tolist.push(itm[1]);
        })
    } else if (!util.isnull(expr)) {
        tolist.push(expr);
    }
    return tolist;
}


// evaluate arguments and process splices
// It is a little difficult to separate out splices and commas.
// The comma says "evaluate the next expression, even if it is
// a special form", and the comma is separated into its own token,
// like parens are. So the expression ",@__args" will produce two
// tokens: a comma token followed by a symbol "@__args".
// The @ splice sigil is not separated, so it must be seen by
// looking at the text of the symbol.
async function eval_and_splice(form, scope, sform) {
    var rs = [],
        i = 0,
        comma = util.sym(',');

    while (i < form.length) {
        var expr = form[i],
            splice = false,
            comma_effect = false;

        // check for comma and move to next form
        if (expr == comma && i < (form.length-1)) {
            comma_effect = true;
            i++;
            expr = form[i];
        }
        
        // check for @ sigil to splice an argument
        if (util.issymbol(expr) && expr.symbol.length && expr.symbol[0] == '@') {
            splice = true;
            expr = util.sym(expr.symbol.substr(1));
        }
        
        // evaluate expression unless special form and no prefixing comma
        if (comma_effect || !sform)
            expr = await eval_sexpr(expr, scope);

        // push or splice in the value
        if (splice)
            rs = splice_join(rs, expr);
        else
            rs.push(expr);

        i++;
    }
    return rs;
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
        args = await eval_and_splice(args, scope, f.sform);
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

