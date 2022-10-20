//
// simple scope object
//


module.exports = {};


const util = require("./util.js"),
      ea = require("./ea.js"),
      paths = require("./paths.js");


function Scope(outer, name) {
    this.outer = outer;
    this.name = name;
    this.vars = {};


    // set a value in this scope
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
    this.$bind = async (names, values, sform) => {
        var me = this;


        var valueof = async function valueof(val, sform) {
            if (sform)
                return val;
            return await ea.eval_sexpr(val, me.outer);
        }


        function isLabel(name) {
            var s = util.tostring(name);
            return (s.length && s[0] == '&');
        }


        function isUnpackSymbol(name) {
            var s = util.tostring(name);
            return (s.length && s[0] == '*');
        }


        // Find a name in the unbound names list
        function findname (name) {
            for (var i = 0; i < unboundNames.length; i++)
                if (name == unboundNames[i])
                    return i;
            return -1;
        }


        // bind name-value
        function bindnv(name, value) {
            me.vars[name] = value;
        }


        // unpack values at a symbol
        async function unpack(sym) {
            // Evaluate symbol and unpack in place
            sym = util.sym(util.tostring(sym).substr(1));
            var v = await valueof(sym, sform);
            if (util.isdict(v)) {
                for (var nv of Object.entries(v)) {
                    nvalues.push (util.sym('&' + nv[0]));
                    nvalues.push(nv[1]);
                }
            } else if (util.islist(v)) {
                nvalues = nvalues.concat(v);
            } else {
                nvalues.push(v);
            }
        }


        // Keep track of values not yet bound, and names not yet bound
        var unboundNames = [],
            unboundValues = [];
        for (i = 0; i < names.length; i++)
            unboundNames.push(util.tostring(names[i]));


        // Unpack operands and evaluate forms
        var nvalues = [];
        for (i = 0; i < values.length; i++) {
            var v = values[i];
            if (isUnpackSymbol(v))
                // unpack values into separate operands
                await unpack(v);
            else if (isLabel(v))
                // preserve label as a symbol
                nvalues.push(v);
            else
                // evaluate form and push resulting value
                nvalues.push(await valueof(v, sform));
        }
        values = nvalues;

        // Look for explicit name bindings first
        var kwargs = {};
        i = 0;
        while (i < (values.length)) {
            var name = values[i];
            if (isLabel(name) && i < (values.length-1)) {
                // bind next value to a param, or insert in kwargs
                var n = util.tostring(name),
                    pidx = findname(n),
                    v = values[i+1];
                if (pidx >= 0) {
                    bindnv(n.substr(1), v);
                    unboundNames[pidx] = null;
                } else {
                    kwargs[n.substr(1)] = v;
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
                if ((vi < unboundValues.length) && (!isLabel(unboundNames[ni]))) {
                    bindnv(unboundNames[ni], unboundValues[vi]);
                    vi++;
                } else {
                    if (isLabel(unboundNames[ni]))
                        bindnv(util.tostring(unboundNames[ni]).substr(1), null)
                    else
                        bindnv(unboundNames[ni], null);
                }
            }
            ni++;
        }

        // Bind any values left over to __args as a list
        if (vi < unboundValues.length) {
            var args = unboundValues.slice(vi);
            if (args.length)
                bindnv('__args', args);
        }

        // Bind kwargs
        if (Object.keys(kwargs).length)
            bindnv('__kwargs', kwargs);
    }
}


async function $destructure(args, scope) {
    var ts = new Scope(scope, "destructuring-bind");
    await ts.$bind(args[0], args[1], false);
    return ts.vars;
}


function create(outer, name) {
    return new Scope(outer, name);
}


module.exports.global = new Scope(null, "global");
module.exports.create = create;
module.exports.$destructure = $destructure;


