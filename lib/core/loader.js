//
// load and execute a lisp source file
//

module.exports = {}


const fs = require("fs"),
      path = require("path"),
      ea = require("./ea.js");


function clean(data) {
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; i++)
        if (lines[i].match(/^\s*;/) != null)
            lines[i] = '';
    return lines.join('\n');
}


async function loadfile(filepath) {
    console.log("load:", filepath);
    var data = fs.readFileSync(filepath, "utf-8");
    data = clean(data);
    await ea.streval(data);
}


async function loaddir(filepath) {
    const files = fs.readdirSync(filepath);
    files.forEach((f) => {
        if (f[0] != '.') {
            f = path.resolve(filepath, f);
            load(f);
        }
    });
}



async function load(filepath) {
    filepath = path.resolve(filepath);
    var stats = fs.statSync(filepath);
    if (stats.isFile())
        await loadfile(filepath);
    else if (stats.isDirectory())
        await loaddir(filepath);
}


module.exports = load;

