//
// Micro-sized Lisp implementation for tailored configuration languages.
//

const repl = require("./repl.js"),
      ea = require("./ea.js"),
      func = require("./func.js"),
      test = require("./test.js");

// require all of the builtin function groups
require("./builtins.js");
require("./lib/types.js");
require("./lib/eq.js");
require("./lib/math.js");
require("./lib/struct.js");
require("./lib/strings.js");
require("./lib/control.js");


func.init();
test.init();

repl.start(ea.eval_str)

