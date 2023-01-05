//
// Micro-sized Lisp implementation for tailored configuration languages.
//

const repl = require("./lib/core/repl.js"),
      lisp = require("./lib/lisp.js");

const options = {
      "dialect" : "clisp"
}

lisp.stdlibs(options);
require("./dw/funcs/mongo.js")(lisp);
require("./dw/funcs/postgres.js");

// lisp.streval("(dbg true)");
lisp.load("./lib/lisp/");
lisp.load("./dw/lisp");

repl.start(lisp.streval);

