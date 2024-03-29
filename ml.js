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
require("./dw/funcs/geospatial.js");

// lisp.streval("(dbg true)");
(async () => {
      await lisp.load("./lib/lisp/");
      await lisp.load("./dw/lisp");
      await lisp.streval("(__start__)");
      repl.start(async (line) => {
            var result = await lisp.streval(line);
            if (result != null && result != undefined) {
                  lisp.global.def("@2", lisp.global.get("@1"));
                  lisp.global.def("@1", result);
            }
            return result;
      });
}) ()


