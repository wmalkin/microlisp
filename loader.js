//
// load and execute a lisp source file
//

module.exports = {}


const ea = require("./ea.js");


function clean(data) {
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; i++)
        if (lines[i].match(/^\s*;/) != null)
            lines[i] = '';
    return lines.join('\n');
}


function load(path) {
    var data = fs.readFileSync(path, "utf-8");
    data = clean(data);
    ea.eval_str(data);
}


module.exports.load = load;

