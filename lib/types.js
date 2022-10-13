//
// type conversion and predicates
//

module.exports = {};

const func = require("../func.js");


function $tostr(args, scope) {
  return util.tostring(args[0]);
}


function $tonum(args, scope) {
  return util.tonum(args[0]);
}


function $tobool(args, scope) {
  return util.tobool(args[0]);
}


function $tolist(args, scope) {
  return util.tolist(args[0]);
}


function $todict(args, scope) {
  return util.todict(args[0]);
}



function $strp(args, scope) {
  return util.isstr(args[0]);
}


function $nump(args, scope) {
  return util.isnumber(args[0]);
}


function $boolp(args, scope) {
  return util.isbool(args[0]);
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
func.def({ name: "tonum", body: $tonum });
func.def({ name: "tobool", body: $tobool });
func.def({ name: "tolist", body: $tolist });
func.def({ name: "todict", body: $todict });

func.def({ name: "strp", body: $strp });
func.def({ name: "nump", body: $nump });
func.def({ name: "boolp", body: $boolp });
func.def({ name: "nullp", body: $nullp });
func.def({ name: "listp", body: $listp });
func.def({ name: "dictp", body: $dictp });
func.def({ name: "funcp", body: $funcp });
func.def({ name: "zerop", body: $zerop });

