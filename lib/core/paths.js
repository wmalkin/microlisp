//
// resolve paths in containers
//


const util = require("./util.js");


function __resolveOne (key, container) {
    if (util.isdict(container))
        return container[key];
    if (util.islist(container)) {
        var i = util.tonum(key);
        if (util.isnumber(i))
            return container[i];
    }
    return undefined;
}


function __resolveInContainer (expr, container) {
    var str_path = util.tostring(expr);

    // First, prefer returning a single element whose key
    // matches the whole expr key
    // ex: { "foo.bar":123 }
    if (util.isdict(container) && container.hasOwnProperty(str_path))
        return { container: container, sym: expr, value: container[str_path] }

    var path = [];
    if (!util.isnull(str_path))
        path = str_path.split('.');

    // follow the dot path
    while (!util.isnull(container) && path.length > 1) {
        var inner = __resolveOne(path[0], container);
        if (util.isdict(inner) || util.islist(inner)) {
            // drill down to next container in the path
            container = inner;
            path.shift();
        } else {
            // failed on a non-leaf path element: return a partial
            // path within the deepest container that was found
            return {
                container: container,
                sym: path.join('.'),
                value: undefined
            }
        }
    }

    return {
        container: container,
        sym: util.islist(container) ? util.tonum(path[0]) : path[0],
        value: __resolveOne(path[0], container)
    }
}


function __putIntoContainer (rsym, value) {


    function __put (container, elem, value) {
        if (util.islist(container))
            elem = util.tonum(elem);
        container[elem] = value;
    }

    var path = util.tostring(rsym.sym).split('.');
    var container = rsym.container;
    while (!util.isnull(container) && path.length > 1) {
        var after = path[1],
            nextContainer = null;
        if (util.isnumber(after) || util.strisint(after))
            nextContainer = [];
        else
            nextContainer = {};
        __put(container, path[0], nextContainer);
        container = nextContainer;
        path.shift();
    }
    __put(container, path[0], value);
}


exports.__resolveInContainer = __resolveInContainer;
exports.__putIntoContainer = __putIntoContainer;



