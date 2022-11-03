//
// Lisp interpreter public interface
//

module.exports = {};

var ea = require("./core/ea.js"),
    scopes = require("./core/scopes.js"),
    func = require("./core/func.js"),
    util = require("./core/util.js"),
    parser = require("./core/parser.js"),
    loader = require("./core/loader.js");

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
require("./funcs/async.js");
require("./funcs/console.js");
require("./core/test.js");


module.exports.load = loader;
module.exports.parse = parser.parse;
module.exports.apply = ea.apply;
module.exports.eval = ea.eval;
module.exports.streval = ea.streval;
module.exports.destructure = scopes.destructure;
module.exports.global = scopes.global;
module.exports.create_scope = scopes.create;
module.exports.def = func.def;

module.exports.isobject = util.isobject;
module.exports.isstring = util.isstring;
module.exports.issymbol = util.issymbol;
module.exports.isnumber = util.isnumber;
module.exports.strisint = util.strisint;
module.exports.isbool = util.isbool;
module.exports.isdate = util.isdate;
module.exports.istrue = util.istrue;
module.exports.isfalse = util.isfalse;
module.exports.istruthy = util.istruthy;
module.exports.isfalsy = util.isfalsy;
module.exports.isnull = util.isnull;
module.exports.islist = util.islist;
module.exports.isdict = util.isdict;
module.exports.isfunc = util.isfunc;
module.exports.isjsfunc = util.isjsfunc;
module.exports.isBooleanString = util.isBooleanString;
module.exports.isNumericString = util.isNumericString;
module.exports.tostring = util.tostring;
module.exports.form_to_str = util.form_to_str;
module.exports.tonum = util.tonum;
module.exports.tobool = util.tobool;
module.exports.todate = util.todate;
module.exports.sym = util.sym;
