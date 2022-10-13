//
// eval-apply loop
//


module.exports = {};


const parser = require("./parser.js"),
      util = require("./util.js"),
      scopes = require("./scopes.js");



// apply a function to a list of arguments
async function apply(f, args, scope) {
    scope = scope || scopes.global;
    if (util.isstring(f) || util.issymbol(f))
        f = scope.$getinchain(f);
    if (util.isfunc(f)) {
        if (!f.issform())
            for (var i = 0; i < args.length; i++)
                args[i] = await eval_sexpr(args[i], scope);
        return await f.call(args, scope);
    }
    return null;
}


// eval a tree sexpr
async function eval_sexpr(sexpr, scope) {
    scope = scope || scopes.global;
    if (util.islist(sexpr) && sexpr.length > 0) {
        var first = await eval_sexpr(sexpr[0], scope);
        if (util.isfunc(first))
            return await apply(first, sexpr.slice(1), scope);
        var rs = [first];
        for (var i = 1; i < sexpr.length; i++)
            rs.push(await eval_sexpr(sexpr[i], scope));
        return rs;
    } else if (util.issymbol(sexpr)) {
        return scope.$getinchain(sexpr);
    }
    return sexpr;
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
