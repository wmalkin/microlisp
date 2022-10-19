//
// wrapper for 'require' that also handles Lisp input files
//


const fspath = require('path');


module.exports = function(path) {
    var rs = null,
        ext = fspath.extname(path);
    console.log("req:", path, "   ext:", ext);
    if (ext.toLowerCase() == '.lisp') {
        console.log("...load a lisp file");
        rs = { lisppath: fspath.resolve(path) };
    } else {
        rs = require(path);
    }
    console.log('...', path);
    return rs;
}

