//
// core functions exported to Lisp from the core js files
//

const func = require("../core/func.js"),
      util = require("../core/util.js"),
      scopes = require("../core/scopes.js"),
      ea = require("../core/ea.js"),
      test = require("../core/test.js");


func.def({ name: "dbg", body: ea.$dbg });
func.def({ name: "apply", body: ea.$apply, sform: true });
func.def({ name: "eval", body: ea.$eval, sform: true });

func.def({ name: "destructure", body: scopes.$destructure, sform: true });

func.def({ name: "func.name", body: func.$func_name });
func.def({ name: "func.docs", body: func.$func_docs });
func.def({ name: "func.bindings", body: func.$func_bindings });
func.def({ name: "func.body", body: func.$func_body });
func.def({ name: "func.closurep", body: func.$func_closurep });
func.def({ name: "func.inlinep", body: func.$func_inlinep });
func.def({ name: "func.sformp", body: func.$func_sformp });
func.def({ name: "func.macrop", body: func.$func_macrop });

func.def({ name:"test", body:test.$test });
func.def({ name:"assert", body:test.$assert, sform: true });
