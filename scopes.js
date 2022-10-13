//
// simple scope object
//


module.exports = {};


const util = require("./util.js"),
            ea = require("./ea.js"),
            paths = require("./paths.js");


function Scope(outer) {
    this.outer = outer;
    this.vars = {};


    this.$let = (sym, value) => {
        var rsym = paths.__resolveInContainer(sym, this.vars);
        paths.__putIntoContainer(rsym, value);
    }


    this.$has = (sym) => {
        sym = util.tostring(sym);
        return this.vars.hasOwnProperty(sym);
    }


    this.$get = (sym) => {
        var rsym = paths.__resolveInContainer(sym, this.vars);
        return rsym.value;
    }


    this.$getinchain = (sym) => {
        var base = util.tostring(sym).split('.')[0];
        var inscope = this;
        while (inscope != null && !inscope.$has(base))
            inscope = inscope.outer;
        if (inscope) {
            var rsym = paths.__resolveInContainer(sym, inscope.vars);
            return rsym.value;
        } else {
            return null;
        }
    }


    // Bind arguments to names in this scope.
    // Example:
    //
    //   (def f1 (fun (p0 p1 p2 p3) ...))
    //
    //   (f1 v0 &p0 v1 &p2 v2 v3 v4 v5)
    //
    //   p0 => v1
    //   p1 => v0
    //   p2 => v2
    //   p3 => v3
    //   __args => [v4,v5]
    //
    // Also supports binding a list of arguments, where the list can
    // contain named arguments or ordered arguments.
    //
    //   (let ops (list 1 2 3))
    //   (f1 *ops)
    //
    this.$bind = (names, values, sform) => {
        var me = this;


        var valueof = function valueof(val, sform) {
            if (sform)
                return val;
            return ea.eval_sexpr(val, me.outer);
        }


        // Keep track of values not yet bound, and names not yet bound
        var unboundNames = [],
            unboundValues = [];
        for (i = 0; i < names.length; i++)
            unboundNames.push(names[i]);


        // Test if a name has an ampersand prefix
        function isLabel(name) {
            return (util.issymbol(name) && name.symbol.length && name.symbol[0] == '&');
        }

        function keyforname(name) {
            name = util.tostring(name);
            if (name.length && (name[0] == '&' || name[0] == '*'))
                name = name.substr(1);
            return name;
        }


        // Find a name in the unbound names list
        function findname (name) {
            name = keyforname(name);
            for (var i = 0; i < unboundNames.length; i++) {
                if (unboundNames[i] != null) {
                    var tname = keyforname(unboundNames[i]);
                    if (name == tname)
                        return i;
                }
            }
            return -1;
        }


        // return if 'name' is a symbol that starts with '&'
        function isboundname(name) {
            if (util.issymbol(name))
                if (isLabel(name))
                    return findname(name);
            return -1;
        }


        // bind name-value
        function bindnv(name, value) {
            me.vars[name] = value;
        }


        // Start by unpacking operands
        var nvalues = [];
        for (i = 0; i < values.length; i++) {
            var v = values[i];
            if (util.issymbol(v) && v.symbol.length && v.symbol[0] == '*') {
                // Evaluate symbol and unpack in place
                v = valueof(v, sform);
                if (util.isdict(v)) {
                    var nvs = [];
                    for (var nv of Object.entries(v)) {
                        nvs.push (util.sym('&' + nv[0]));
                        nvs.push(nv[1]);
                    }
                    v = nvs;
                } else if (util.islist(v)) {
                    nvalues = nvalues.concat(v);
                } else {
                    nvalues.push(v);
                }
            } else {
                nvalues.push(v);
            }
        }
        values = nvalues;

        // Look for explicit name bindings first
        var kwargs = {};
        i = 0;
        while (i < values.length) {
            var name = values[i];
            if (isLabel(name)) {
                // bind next value to a param, or insert in kwargs
                var pidx = findname(name),
                    n = keyforname(name),
                    v = valueof(values[i+1], sform);
                if (pidx >= 0) {
                    bindnv(n, v);
                    unboundNames[pidx] = null;
                } else {
                    kwargs[n] = v;
                }
                i += 2;
            } else {
                unboundValues.push(values[i]);
                i++;
            }
        }

        // Bind remaining names to the next values in order
        var vi = 0,
            ni = 0;
        while (ni < unboundNames.length) {
            if (unboundNames[ni] != null) {
                if ((vi < unboundValues.length) && (!isLabel(unboundNames[ni]))){
                    bindnv(keyforname(unboundNames[ni]), valueof(unboundValues[vi], sform));
                    vi++;
                } else {
                    bindnv(keyforname(unboundNames[ni]), null);
                }
            }
            ni++;
        }

        // Bind any values left over to __args as a list
        if (vi < unboundValues.length) {
            var args = unboundValues.slice(vi);
            for (var i = 0; i < args.length; i++)
                args[i] = valueof(args[i], sform);
            if (args.length)
                bindnv('__args', args);
        }

        // Bind kwargs
        if (Object.keys(kwargs).length)
            bindnv('__kwargs', kwargs);
    }
}


function create(outer) {
    return new Scope(outer);
}


module.exports.global = new Scope(null);
module.exports.create = create;



