//
// load and execute a lisp source file
//

const fs = require("fs").promises,
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
    var data = await fs.readFile(filepath, "utf-8");
    data = clean(data);
    await ea.streval(data);
}


async function loaddir(filepath) {
    const files = await fs.readdir(filepath);
    // files.forEach(async (f) => {
    //     if (f[0] != '.') {
    //         f = path.resolve(filepath, f);
    //         await load(f);
    //     }
    // });
    var i = 0;
    while (i < files.length) {
        if (files[i][0] != '.') {
            var f = path.resolve(filepath, files[i]);
            await load(f);
        }
        i++;
    }
}



async function load(filepath) {
    filepath = path.resolve(filepath);
    var stats = await fs.stat(filepath);
    if (stats.isFile())
        await loadfile(filepath);
    else if (stats.isDirectory())
        await loaddir(filepath);
}


module.exports = load;

