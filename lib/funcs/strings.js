//
// string manipulations
//

module.exports = {};


const util = require("../core/util.js"),
      func = require("../core/func.js");


function $cat(args, scope) {
    var rs = "";
    for (var i = 0; i < args.length; i++)
        rs += util.tostring(args[i]);
    return rs;
}


function $substr(args, scope) {
    var s = util.tostring(args[0]);
    if (args.length < 2)
        return s;
    var start = util.tonum(args[1]);
    if (args.length < 3)
        return s.substr(start);
    var len = util.tonum(args[2]);
    return s.substr(start, len);
}


function $repl(args, scope) {
    var src = util.tostring(args[0]);
    var srch = util.tostring(args[1]);
    var repl = util.tostring(args[2]);
    var pattern = new RegExp(srch, "g");
    return src.replace(pattern, repl);
}


function $charcode(args, scope) {
    var src = util.tostring(args[0])
    if (src.length == 1)
        return src.charCodeAt(0);
    else {
        var rs = [];
        for (var i = 0; i < src.length; i++)
            rs.push(src.charCodeAt(i));
        return rs;
    }
}


function $fromcharcode(args, scope) {
    var rs = "";
    for (var i = 0; i < args.length; i++)
        rs += String.fromCharCode(util.tonum(args[i]));
    return rs;
}


function $padleft(args, scope) {
    var padchar = ' ';
    var s1 = util.tostring(args[0]);
    var len = util.tonum(args[1]);
    if (args.length > 2)
        padchar = util.tostring(args[2])[0];
    while (s1.length < len)
        s1 = padchar + s1;
    return s1;
}


function $padright(args, scope) {
    var padchar = ' ';
    var s1 = util.tostring(args[0]);
    var len = util.tonum(args[1]);
    if (args.length > 2)
        padchar = util.tostring(args[2])[0];
    while (s1.length < len)
        s1 = s1 + padchar;
    return s1;
}


function $trim(args, scope) {
    var s = util.tostring(args[0]);
    while (s.length > 0 && s[0] == ' ')
        s = s.substr(1);
    while (s.length > 0 && s[s.length - 1] == ' ')
        s = s.substr(0, s.length - 1);
    return s;
}


function indexof(args) {
    var s1 = util.tostring(args[0]),
            s2 = util.tostring(args[1]);
    if (s1 && s2)
        return s1.indexOf(s2);
    return null;
}


function lastindexof(args) {
    var s1 = util.tostring(args[0]),
            s2 = util.tostring(args[1]);
    if (s1 && s2)
        return s1.lastIndexOf(s2);
    return null;
}


function $idxof(args, scope) {
    return indexof(args);
}


function $lastidxof(args, scope) {
    return lastindexof(args);
}


function $starts(args, scope) {
    return indexof(args) === 0;
}


function $ends(args, scope) {
    var s1 = util.tostring(args[0]),
            s2 = util.tostring(args[1]);
    if (s1 && s2)
        return s1.lastIndexOf(s2) === (s1.length - s2.length);
    return null;
}


function $cont(args, scope) {
    return indexof(args) >= 0;
}


function $split(args, scope) {
    var v = util.tostring(args[0]),
            delim = ',';
    if (args.length > 1)
        delim = util.tostring(args[1]);
    if (util.isstring(v))
        return v.split(delim);
    return null;
}


function $join(args, scope) {
    var delim = ',';
    if (args.length > 1)
        delim = args[1];
    if (util.islist(args[0]))
        return args[0].join(delim);
    return null;
}


function $upper(args, scope) {
    var v = util.tostring(args[0]);
    if (v)
        v = v.toUpperCase();
    return v;
}


function $lower(args, scope) {
    var v = util.tostring(args[0]);
    if (v)
        v = v.toLowerCase();
    return v;
}


function $jparse(args, scope) {
    return JSON.parse(args[0]);
}


function $jstring(args, scope) {
    return JSON.stringify(args[0]);
}



func.def({ name: "cat", body: $cat });
func.def({ name: "substr", body: $substr });
func.def({ name: "repl", body: $repl });
func.def({ name: "charcode", body: $charcode });
func.def({ name: "fromcharcode", body: $fromcharcode });
func.def({ name: "padleft", body: $padleft });
func.def({ name: "padright", body: $padright });
func.def({ name: "trim", body: $trim });

func.def({ name: "idxof", body: $idxof });
func.def({ name: "lastidxof", body: $lastidxof });
func.def({ name: "starts", body: $starts });
func.def({ name: "ends", body: $ends });
func.def({ name: "cont", body: $cont });

func.def({ name: "split", body: $split });
func.def({ name: "join", body: $join });
func.def({ name: "upper", body: $upper });
func.def({ name: "lower", body: $lower });

func.def({ name: "jparse", body: $jparse });
func.def({ name: "jstring", body: $jstring });


