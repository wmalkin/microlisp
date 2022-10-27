//
// type conversion and predicates
//

module.exports = {};


const func = require("../core/func.js"),
      util = require("../core/util.js");


function $tostr(args, scope) {
    return util.tostring(args[0]);
}


function $prtform(args, scope) {
    return util.form_to_str(args[0]);
}


function $tosym(args, scope) {
    return util.sym(args[0]);
}


function $tonum(args, scope) {
    return util.tonum(args[0]);
}


function $tobool(args, scope) {
    return util.tobool(args[0]);
}


function $todate(args, scope) {
    return util.todate(args[0]);
}


function $tolist(args, scope) {
    return util.tolist(args[0]);
}


function $todict(args, scope) {
    return util.todict(args[0]);
}



function $strp(args, scope) {
    return util.isstring(args[0]);
}


function symp(args, scope) {
    return util.issymbol(args[0]);
}


function $nump(args, scope) {
    return util.isnumber(args[0]);
}


function $boolp(args, scope) {
    return util.isbool(args[0]);
}


function $datep(args, scope) {
    return util.isdate(args[0]);
}


function $nullp(args, scope) {
    return util.isnull(args[0]);
}


function $listp(args, scope) {
    return util.islist(args[0]);
}


function $dictp(args, scope) {
    return util.isdict(args[0]);
}


function $funcp(args, scope) {
    return util.isfunc(args[0]);
}


function $zerop(args, scope) {
    return util.tonum(args[0]) == 0;
}



func.def({ name: "tostr", body: $tostr });
func.def({ name: "prtform", body: $prtform });
func.def({ name: "tosym", body: $tosym });
func.def({ name: "tonum", body: $tonum });
func.def({ name: "tobool", body: $tobool });
func.def({ name: "todate", body: $todate });
func.def({ name: "tolist", body: $tolist });
func.def({ name: "todict", body: $todict });

func.def({ name: "strp", body: $strp });
func.def({ name: "symp", body: symp });
func.def({ name: "nump", body: $nump });
func.def({ name: "boolp", body: $boolp });
func.def({ name: "datep", body: $datep });
func.def({ name: "nullp", body: $nullp });
func.def({ name: "listp", body: $listp });
func.def({ name: "dictp", body: $dictp });
func.def({ name: "funcp", body: $funcp });
func.def({ name: "zerop", body: $zerop });

