//
// Micro-sized Lisp implementation for tailored configuration languages.
//

const util = require("./lib/core/util.js"),
      repl = require("./lib/core/repl.js"),
      ea = require("./lib/core/ea.js"),
      test = require("./lib/core/test.js"),
      load = require("./lib/core/loader.js");


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

load("./lib/lisp/lang.lisp");

// test.init();
repl.start(ea.eval_str)

