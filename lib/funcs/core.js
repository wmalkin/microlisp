//
// core functions exported to Lisp from the core js files
//

const func = require("../core/func.js"),
      util = require("../core/util.js"),
      scopes = require("../core/scopes.js"),
      ea = require("../core/ea.js"),
      test = require("../core/test.js");


func.def({ name: "dbg", body: ea.$dbg, docs: "(dbg on &sym &scope): Enable/disable debug trace to console." });
func.def({ name: "apply", body: ea.$apply, sform: true, docs: "(apply func args...): apply a function to a list of arguments." });
func.def({ name: "eval", body: ea.$eval, sform: true, docs: "(eval form): <special forn>" });

func.def({ name: "destructure", body: scopes.$destructure, sform: true, docs: "()" });

func.def({ name: "func.name", body: func.$func_name, docs: "(func.name f): Return the name of a function" });
func.def({ name: "func.docs", body: func.$func_docs, docs: "(func.docs f): Return the docstring of a function" });
func.def({ name: "func.bindings", body: func.$func_bindings, docs: "(func.bindings f): Return the bindings of a function" });
func.def({ name: "func.body", body: func.$func_body, docs: "(func.body f): Return the body forms of a function" });
func.def({ name: "func.type", body: func.$func_type, docs: "(func.type f): Return the type of a function" });
func.def({ name: "func.closurep", body: func.$func_closurep, docs: "(func.closurep f): Return true if a function is a closure" });
func.def({ name: "func.inlinep", body: func.$func_inlinep, docs: "(func.inlinep f): Return true if a function is an inline" });
func.def({ name: "func.sformp", body: func.$func_sformp, docs: "(func.sformp f): Return true if a function is a special form" });
func.def({ name: "func.macrop", body: func.$func_macrop, docs: "(func.macrop f): Return true if a function is a macro" });

func.def({ name:"test", body:test.$test });
func.def({ name:"assert", body:test.$assert, sform: true });
