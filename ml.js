//
// Micro-sized Lisp implementation for tailored configuration languages.
//

const repl = require("./lib/core/repl.js"),
      ea = require("./lib/core/ea.js");


require("./lib/funcs/lang.js");
require("./lib/funcs/types.js");
require("./lib/funcs/eq.js");
require("./lib/funcs/math.js");
require("./lib/funcs/struct.js");
require("./lib/funcs/strings.js");
require("./lib/funcs/control.js");
require("./lib/funcs/defun.js");
require("./lib/funcs/async.js");
require("./lib/funcs/mongo.js");
require("./lib/core/test.js");

require("./lib/core/loader.js")("./lib/lisp/");

repl.start(ea.eval_str)

