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
(async () => {
      await lisp.load("./lib/lisp/");
      await lisp.load("./dw/lisp");
      await lisp.streval("(progn (prt 'run deferred') (_run_deferred_))");
      repl.start(lisp.streval);
}) ()


