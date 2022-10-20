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
            out += util.tolisp(arg) + " ";
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
        f = scope.$getinchain(f);

    if (dbg)
        log("apply>", f.name, args);
    depth++;
    var rs = null;
    if (util.isfunc(f)) {
        if (!f.issform())
            for (var i = 0; i < args.length; i++)
                args[i] = await eval_sexpr(args[i], scope);
        rs = await f.call(args, scope);
    }
    depth--;
    if (dbg)
        log("apply<", f.name, rs);
    return rs;
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
        rs = scope.$getinchain(sexpr);
    }
    depth--;
    if (dbg)
        log("eval<", rs);
    return rs;
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
