//
// simple scope object
//


const util = require("./util.js"),
      ea = require("./ea.js"),
      paths = require("./paths.js");

const inspect_custom = Symbol.for('nodejs.util.inspect.custom');


function Scope(outer, name) {
    this.outer = outer;
    this.name = name;
    this.vars = {};


    this[inspect_custom] = (depth) => {
        return 'Scope<' + this.name + '>';
    }


    // find a scope that contains a symbol
    this.findscope = (sym, global) => {
        var first = util.tostring(sym).split('.')[0];
        var target = this;
        while (target && !target.has(first))
            target = target.outer;
        if (target == null)
            if (global)
                target = globalScope;
            else
                target = this;
        return target;
    }


    // define a symbol in this scope
    this.def = (sym, value) => {
        //console.log(this.name, "def", sym);
        var rsym = paths.__resolveInContainer(sym, this.vars);
        paths.__putIntoContainer(rsym, value);
    }


    // Redefine sym where sym is already defined. If sym is not
    // already defined, then define it either here or in the
    // global scope.
    this.let = (sym, value, global) => {
        //console.log(this.name, "let", sym);
        var target = this.findscope(sym, global);
        var rsym = paths.__resolveInContainer(sym, target.vars);
        paths.__putIntoContainer(rsym, value);
    }


    this.letkv = (kv) => {
        var i = 0;
        while (i < (kv.length-1)) {
            this.let(kv[i], kv[i+1]);
            i += 2;
        }
    }


    this.has = (sym) => {
        sym = util.tostring(sym);
        return this.vars.hasOwnProperty(sym);
    }


    this.get = (sym) => {
        var rsym = paths.__resolveInContainer(sym, this.vars);
        return rsym.value;
    }


    this.getinchain = (sym) => {
        var base = util.tostring(sym).split('.')[0];
        var inscope = this;
        while (inscope != null && !inscope.has(base))
            inscope = inscope.outer;
        if (inscope) {
            var rsym = paths.__resolveInContainer(sym, inscope.vars);
            return rsym.value;
        } else {
            return null;
        }
    }


    // Bind arguments to names in this scope.
    this.bind = async (names, values, sform) => {
        var me = this;
        var sym_comma = util.sym(',');


        var valueof = async function valueof(val, sform) {
            if (sform)
                return val;
            return await ea.eval(val, me.outer);
        }


        function isLabel(name) {
            if (util.issymbol(name))
                return name.symbol.length && name.symbol[0] == '&';
            if (util.isstring(name))
                return name.length && name[0] == '&';
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
        async function unpack(sym, comma_escape) {
            // Evaluate symbol and unpack in place
            sym = util.sym(util.tostring(sym).substr(1));
            var v = await valueof(sym, !comma_escape && sform);
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


        // split names, if not already a list
        if (util.isstring(names))
            names = names.split(" ");
        
        // Keep track of values not yet bound, and names not yet bound
        var unboundNames = [],
            unboundValues = [];
        for (i = 0; i < names.length; i++)
            unboundNames.push(util.tostring(names[i]));


        // Unpack operands and evaluate forms
        var nvalues = [];
        for (i = 0; i < values.length; i++) {
            var v = values[i],
                comma_escape = false;
            // if (v == sym_comma && i < (values.length-1)) {
            //     comma_escape = true;
            //     i++;
            //     v = values[i];
            // }
            // if (util.issymbol(v) && v.symbol.length && v.symbol[0] == '*')
            //     // unpack values into separate operands
            //     await unpack(v, comma_escape);
            // else
                if (isLabel(v))
                // preserve label as a symbol
                nvalues.push(v);
            else
                // evaluate form and push resulting value
                nvalues.push(v);
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
        //  else {
        //     bindnv('__args', []);
        // }

        // Bind kwargs
        if (Object.keys(kwargs).length)
            bindnv('__kwargs', kwargs);
        // else
        //     bindnv('__kwargs', {});
    }
}


    



var globalScope = new Scope(null, "global");


async function destructure(bindings, values, scope) {
    var ts = new Scope(scope, "destructuring-bind");
    await ts.bind(bindings, values, false);
    return ts.vars;
}


async function $destructure(args, scope) {
    return destructure(args[0], args[1], scope);
}


function create(outer, name) {
    return new Scope(outer, name);
}


exports.global = globalScope;
exports.create = create;
exports.destructure = destructure;

exports.$destructure = $destructure;


