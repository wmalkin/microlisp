//
// some utilities
//

module.exports = {};


const func = require("./func.js");


// symbol table
function SYMBOL(s) {
    this.symbol = s;
}

var gsyms = {};

function sym(s) {
    if (issymbol(s))
        return s;
    if (isstring(s)) {
        if (!gsyms[s])
            gsyms[s] = new SYMBOL(s);
        return gsyms[s];
    }
    return null;
}


function isobject(expr) {
    return typeof expr === 'object';
}


function isstring(expr) {
    return typeof expr === 'string' || expr instanceof String;
}


function issymbol(expr) {
    return expr != null && isobject(expr) && expr.constructor === SYMBOL;
}


function isnumber(expr) {
    return typeof expr === 'number' && isFinite(expr);
}

function isbool(expr) {
    return expr === true || expr === false;
}

function isdate(expr) {
    return expr instanceof Date;
}


function istrue(expr) {
    return expr === true;
}


function isfalse(expr) {
    return expr === false;
}


function isnull(expr) {
    return expr === null || expr === undefined;
}


function islist(expr) {
    return expr != null && isobject(expr) && expr.constructor === Array;
}


function isdict(expr) {
    return expr != null && isobject(expr) && expr.constructor == Object;
}


function isfunc(expr) {
    return expr != null && isobject(expr) && expr.constructor === func.FUNC;
}


function isjsfunc(expr) {
    var tof = typeof expr;
    return (tof === 'function' || tof === 'AsyncFunction'); 
}


function isNumericString(v) {
    if (typeof v !== "string") return false;
    if (v.indexOf(".") != v.lastIndexOf(".")) return false;
    if (v.lastIndexOf("-") > 0) return false;
    return /^(-)?[\d]+$/.test(v.replace(".", ""));
}


function isBooleanString(v) {
    return v === 'true' || v === 'T' || v === 'false' || v === 'nil';
}


function tovalue(expr) {
    if (expr == undefined)
        return null;
    if (isstring(expr))
        if (expr == 'null')
            return null;
    if (issymbol(expr))
        if (expr.symbol == 'null')
            return null;
    return expr;
}


// return a lisp form as a string
function form_to_str(expr, fform) {
    if (isstring(expr)) return '"' + expr + '"';
    if (issymbol(expr)) return expr.symbol;
    if (isnumber(expr)) return "" + expr;
    if (isbool(expr)) return expr ? 'true' : 'false';
    if (islist(expr)) {
        if (expr.length == 0)
            return "()";
        var rs = [];
        for (var k in expr)
            rs.push(form_to_str(expr[k]));
        return "(" + rs.join(" ") + ")";
    }
    if (isdict(expr)) {
        var rs = [];
        for (var k in expr)
            rs.push(form_to_str(k) + " " + form_to_str(expr[k]));
        return '{ ' + rs.join(' ') + ' }';
    }
    if (isfunc(expr)) {
        var rs = '(';
        if (expr.macro)
            rs += 'macro';
        else if (expr.sform)
            rs += 'sform';
        else
            rs += 'fun';
        rs += " " + expr.name;
        if (expr.bindings)
            rs += " " + form_to_str(expr.bindings);
        switch(expr.type) {
            case 'sexpr':
                rs += " " + form_to_str(expr.body);
                break;
            case 'js':
                rs += " <js>";
                break;
            default:
                rs += '<?body?>';
                break;
        }
        rs += ")";
        return rs;
    }
    return "" + expr;
}


function tostring(expr) {
    if (isstring(expr)) return expr;
    return form_to_str(expr);
}


function strisint(str) {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}


function tonum(expr) {
    expr = tovalue(expr);
    if (isnull(expr))
        return expr;
    if (isnumber(expr))
        return expr;
    if (isstring(expr))
        if (/^(-)?\d*(\.\d+)?$/.test(expr))
            return parseFloat(expr);
    if (istrue(expr))
        return 1;
    if (isfalse(expr))
        return 0;
    if (isdate(expr))
        return expr.getTime();
    return 0.0;
}


function tobool(expr) {
    expr = tovalue(expr);
    if (isnull(expr))
        return expr;
    if (isstring(expr) || issymbol(expr)) {
        var s = tostring(expr);
        if (/^(-)?\d+(\.\d+)?$/.test(s))
            return parseFloat(s) != 0;
        if (s === 'true' || s === 'T')
            return true;
        if (s === 'false' || s === 'nil')
            return false;
    }
    return expr ? true : false;
}


function todate(expr) {
    expr = tovalue(expr);
    if (isnull(expr))
        return null;
    var rs = new Date(expr);
    if (rs)
        return rs;
    return null;
}


function istruthy(expr) {
    return !!tobool(expr);
}


function isfalsy(expr) {
    return !tobool(expr);
}


module.exports.isobject = isobject;
module.exports.isstring = isstring;
module.exports.issymbol = issymbol;
module.exports.isnumber = isnumber;
module.exports.strisint = strisint;
module.exports.isbool = isbool;
module.exports.isdate = isdate;
module.exports.istrue = istrue;
module.exports.isfalse = isfalse;
module.exports.istruthy = istruthy;
module.exports.isfalsy = isfalsy;
module.exports.isnull = isnull;
module.exports.islist = islist;
module.exports.isdict = isdict;
module.exports.isfunc = isfunc;
module.exports.isjsfunc = isjsfunc;

module.exports.isBooleanString = isBooleanString;
module.exports.isNumericString = isNumericString;

module.exports.tostring = tostring;
module.exports.form_to_str = form_to_str;
module.exports.tonum = tonum;
module.exports.tobool = tobool;
module.exports.todate = todate;

module.exports.sym = sym;


