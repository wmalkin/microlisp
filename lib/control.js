//
// control flow
//


module.exports = {};

const func = require("../func.js"),
            ea = require("../ea.js");


async function $if(args, scope) {
    if (args.length > 1) {
        var ifclause = await ea.eval_sexpr(args[0], scope);
        if (util.tobool(ifclause))
            return await ea.eval_sexpr(args[1], scope);
        else if (args.length > 2)
            return await ea.eval_sexpr(args[2], scope);
    }
    return null;
}


async function $while(args, scope) {
    var test = args[0],
            body = args[1],
            rs = null;
    while (util.istruthy(await ea.eval_sexpr(test, scope)))
        rs = await ea.eval_sexpr(body, scope);
    return rs;
}


async function $until(args, scope) {
    var test = args[0],
            body = args[1],
            rs = null;
    while (util.isfalsy(await ea.eval_sexpr(test, scope)))
        rs = await ea.eval_sexpr(body, scope);
    return rs;
}


// (for (i 1 10 2) body...)
async function $for(args, scope) {
    var rs = null,
            options = args[0],
            gsym = options[0],
            ifrom = 0,
            ito = util.tonum(options[1]),
            iinc = 1;
    if (options.length > 2) {
        ifrom = ito;
        ito = util.tonum(options[2]);
    }
    if (options.length > 3)
        iinc = util.tonum(options[3]);
    for (var i = ifrom; (iinc > 0 ? i < ito : i > ito); i += iinc) {
        scope.$let(gsym, i);
        for (var si = 1; si < args.length; si++)
            rs = await ea.eval_sexpr(args[si], scope);
    }
    return rs;
}


async function $cond(args, scope) {
    var test = 0;
    while (test < args.length) {
        var tuple = args[test];
        if (util.islist(tuple)) {
            if (tuple.length == 2)
                if (util.istruthy(await ea.eval_sexpr(tuple[0], scope)))
                    return await ea.eval_sexpr(tuple[1], scope);
        } else {
            if (test == args.length-1)
                return await ea.eval_sexpr(tuple, scope);
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



func.def({ name: "if", body: $if, sform: true });
func.def({ name: "while", body: $while, sform: true });
func.def({ name: "until", body: $until, sform: true });
func.def({ name: "for", body: $for, sform: true });
func.def({ name: "cond", body: $cond, sform: true });

func.def({ name: "map", body: $map, sform: false });
func.def({ name: "each", body: $each, sform: false });
func.def({ name: "filter", body: $filter, sform: false });
func.def({ name: "fold", body: $fold, sform: false });


