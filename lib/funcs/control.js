//
// control flow
//


const func = require("../core/func.js"),
      ea = require("../core/ea.js"),
      util = require("../core/util.js"),
      scopes = require("../core/scopes.js"),
      lang = require("./lang.js");


async function $if(args, scope) {
    if (args.length > 1) {
        var ifclause = await ea.eval(args[0], scope);
        if (util.tobool(ifclause))
            return await ea.eval(args[1], scope);
        else if (args.length > 2)
            return await ea.eval(args[2], scope);
    }
    return null;
}


async function $while(args, scope) {
    var test = args[0],
        body = args.slice(1),
        rs = null;
    while (util.istruthy(await ea.eval(test, scope)))
        rs = await lang.$progn(body, scope);
    return rs;
}


async function $until(args, scope) {
    var test = args[0],
        body = args.slice(1),
            rs = null;
    while (util.isfalsy(await ea.eval(test, scope)))
        rs = await lang.$progn(body, scope);
    return rs;
}


// (for (i 1 10 2) body...)
async function $for(args, scope) {
    var rs = null,
            options = args[0],
            body = args.slice(1),
            gsym = options[0],
            ifrom = 0,
            ito = util.tonum(await ea.eval(options[1], scope)),
            iinc = 1;
    if (options.length > 2) {
        ifrom = ito;
        ito = util.tonum(await ea.eval(options[2], scope));
    }
    if (options.length > 3)
        iinc = util.tonum(await ea.eval(options[3], scope));
    for (var i = ifrom; (iinc > 0 ? i < ito : i > ito); i += iinc) {
        await scope.let(gsym, i);
        rs = await lang.$progn(body, scope);
    }
    return rs;
}


async function $cond(args, scope) {
    var test = 0;
    while (test < args.length) {
        var tuple = args[test];
        if (util.islist(tuple)) {
            if (tuple.length == 2)
                if (util.istruthy(await ea.eval(tuple[0], scope)))
                    return await ea.eval(tuple[1], scope);
        } else {
            if (test == args.length-1)
                return await ea.eval(tuple, scope);
        }
        test++;
    }
}


async function $map(args, scope) {
    var inp = args[0],
            f = args[1];
    if (util.isdict(inp)) {
        var rs = {}
        for (var itm of Object.entries(inp)) {
            rs[itm[0]] = await ea.apply(f, [itm[1], itm[0]], scope);
        }
        return rs;
    }
    if (util.islist(inp)) {
        var rs = [];
        for (var i = 0; i < inp.length; i++)
            rs.push(await ea.apply(f, [inp[i], i], scope));
        return rs;
    }
    return await ea.apply(f, [inp], scope);
}


async function $each(args, scope) {
    var inp = args[0],
            f = args[1];
    if (util.isdict(inp)) {
        for (var itm of Object.entries(inp)) {
            await ea.apply(f, [itm[1], itm[0]], scope);
        }
    } else if (util.islist(inp)) {
        for (var i = 0; i < inp.length; i++)
            await ea.apply(f, [inp[i], i], scope);
    } else await ea.apply(f, [inp], scope);
    return null;
}


async function $filter(args, scope) {
    var inp = args[0],
            f = args[1];
    if (util.isdict(inp)) {
        var rs = {}
        for (var itm of Object.entries(inp)) {
            if (util.istruthy(await ea.apply(f, [itm[1], itm[0]], scope)))
                rs[itm[0]] = itm[1];
        }
        return rs;
    }
    if (util.islist(inp)) {
        var rs = [];
        for (var i = 0; i < inp.length; i++)
            if (util.istruthy(await ea.apply(f, [inp[i], i], scope)))
                rs.push(inp[i]);
        return rs;
    }
    if (util.istruthy(await ea.apply(f, [inp], scope)))
        return inp;
    return null;
}


async function $fold(args, scope) {
    var inp = args[0],
            sum = args[1],
            f = args[2];
    for (var i = 0; i < inp.length; i++)
        sum = await ea.apply(f, [sum, inp[i]], scope);
    return sum;
}



func.def({ name: "if", body: $if, sform: true, docs: "(if test t f): <special form> Evaluate test, then evaluate and return either t or f form, but not both." });
func.def({ name: "while", body: $while, sform: true, docs: "(while test body...): <special form> While test evaluates true, evaluate body forms" });
func.def({ name: "until", body: $until, sform: true, docs: "(until test body...): <special form> Until test evaluates true, evaluate body forms" });
func.def({ name: "for", body: $for, sform: true, docs: "(for (sym from [to [inc]]) forms...): <special form> Evaluate forms with sym bound to values in range." });
func.def({ name: "cond", body: $cond, sform: true, docs: "(cond (test form)...): <special form> Return the evaluated second form of the first tuple whose test evaluates true." });

func.def({ name: "map", body: $map, docs: "(map coll fun): Apply fun over the members of coll and return a new collection." });
func.def({ name: "each", body: $each, docs: "(each coll fun): Apply fun to each member of coll, discarding results." });
func.def({ name: "filter", body: $filter, docs: "(filter coll fun): Return a new collection whose members are those in coll matching the test fun." });
func.def({ name: "fold", body: $fold, docs: "(fold coll initial-value fun)" });


