//
// Lisp interpreter public interface
//

var ea = require("./core/ea.js"),
    scopes = require("./core/scopes.js"),
    func = require("./core/func.js"),
    util = require("./core/util.js"),
    parser = require("./core/parser.js"),
    loader = require("./core/loader.js");


function stdlibs(opts) {
    scopes.global.def("_options_", opts);
    require("./funcs/core.js");
    require("./funcs/exceptions.js");
    require("./funcs/lang.js");
    require("./funcs/types.js");
    require("./funcs/dates.js");
    require("./funcs/num.js");
    require("./funcs/eq.js");
    require("./funcs/math.js");
    require("./funcs/struct.js");
    require("./funcs/strings.js");
    require("./funcs/control.js");
    require("./funcs/defun.js");
    require("./funcs/console.js");
    require("./funcs/fs.js");
    require("./funcs/udp.js");
    require("./funcs/timers.js");
    require("./funcs/bus.js");
    require("./core/test.js");
}


exports.stdlibs = stdlibs;

exports.load = loader;

exports.parse = parser.parse;

exports.apply = ea.apply;
exports.eval = ea.eval;
exports.streval = ea.streval;

exports.destructure = scopes.destructure;
exports.global = scopes.global;
exports.create_scope = scopes.create;

exports.def = func.def;

exports.isobject = util.isobject;
exports.isstring = util.isstring;
exports.issymbol = util.issymbol;
exports.isnumber = util.isnumber;
exports.strisint = util.strisint;
exports.isbool = util.isbool;
exports.isdate = util.isdate;
exports.istrue = util.istrue;
exports.isfalse = util.isfalse;
exports.istruthy = util.istruthy;
exports.isfalsy = util.isfalsy;
exports.isnull = util.isnull;
exports.islist = util.islist;
exports.isdict = util.isdict;
exports.isfunc = util.isfunc;
exports.isjsfunc = util.isjsfunc;
exports.isBooleanString = util.isBooleanString;
exports.isNumericString = util.isNumericString;
exports.tostring = util.tostring;
exports.tolisp = util.tolisp;
exports.tojson = util.tojson;
exports.tonum = util.tonum;
exports.tobool = util.tobool;
exports.todate = util.todate;
exports.sym = util.sym;

