//
// Lisp functions wrapping the 'fs' module for file system access
//

const func = require("../core/func.js"),
      ea = require("../core/ea.js"),
      scopes = require("../core/scopes.js"),
      util = require("../core/util.js");

const fs = require("fs").promises;


// todo: deep comparisons of structs

async function $with_file(args, scope) {
    var opts = await scopes.destructure("path sym &flags &mode", args, scope);
    var filescope = scopes.create(scope, "fs"),
        path = await ea.eval(opts.path, scope),
        flags = opts.flags ? await ea.eval(opts.flags, scope) : null,
        mode = opts.mode ? await ea.eval(opts.mode, scope) : null;

    var fh = await fs.open(path, flags, mode);
    filescope.def(opts.sym, fh);

    var rs = await ea.apply("progn", opts.__args, filescope);
    fh.close();
}


async function $read_file(args, scope) {
    const fh = args[0];
    return fh.readFile();
}


async function $write_file(args, scope) {
    const fh = args[0],
          contents = args[1];
    return fh.writeFile(contents);
}


func.def({ name: "fs.with-file", body: $with_file, sform: true });
func.def({ name: "fs.read-file", body: $read_file });
func.def({ name: "fs.write-file", body: $write_file });

