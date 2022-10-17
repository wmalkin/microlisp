//
// Micro-sized Lisp implementation for tailored configuration languages.
//

const repl = require("./repl.js"),
      ea = require("./ea.js"),
      test = require("./test.js"),
      loader = require("./loader.js");


// require all of the builtin function groups
require("./lib/lang.js");
require("./lib/types.js");
require("./lib/eq.js");
require("./lib/math.js");
require("./lib/struct.js");
require("./lib/strings.js");
require("./lib/control.js");
require("./lib/defun.js");
require("./lib/async.js");
require("./lib/mongo.js");

// require Lisp libs
loader.load("./lisp/lang.lisp")


test.init();

repl.start(ea.eval_str)

