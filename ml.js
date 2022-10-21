//
// Micro-sized Lisp implementation for tailored configuration languages.
//

const repl = require("./lib/core/repl.js"),
      lisp = require("./lib/lisp.js");

require("./db/funcs/mongo.js")(lisp);

lisp.load("./lib/lisp/");
lisp.load("./db/lisp");

repl.start(lisp.seval);

