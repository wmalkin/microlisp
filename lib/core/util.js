//
// some utilities
//

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
function escape_str(str, delim) {
    var rs = '';
    for (var i = 0; i < str.length; i++)
        switch (str[i]) {
            case delim:
                rs += '\\' + delim;
                break;
            case '\n':
                rs += '\\n';
                break;
            case '\r':
                rs += '\\r';
                break;
            case '\t':
                rs += '\\t';
                break;
            default:
                rs += str[i];
                break;
        }
    return rs;
}


const compact_syntax = {
    list_open: '(',
    list_separator: ' ',
    list_close: ')',
    dict_open: '{',
    dict_kv_separator: ' ',
    dict_item_separator: ' ',
    dict_close: '}',
    func_open: '(',
    func_separator: ' ',
    func_close: ')',
    string_delim: '"'
}

const lisp_syntax = {
    list_open: '(list ',
    list_separator: ' ',
    list_close: ')',
    dict_open: '(dict ',
    dict_kv_separator: ' ',
    dict_item_separator: ' ',
    dict_close: ')',
    func_open: '(',
    func_separator: ' ',
    func_close: ')',
    string_delim: '"'
}

const json_syntax = {
    list_open: '[',
    list_separator: ',',
    list_close: ']',
    dict_open: '{',
    dict_kv_separator: ':',
    dict_item_separator: ',',
    dict_close: '}',
    func_open: '[',
    func_separator: ',',
    func_close: ']',
    string_delim: '"'
}


function form_to_str(expr, syntax) {
    syntax = syntax || compact_syntax;
    if (isstring(expr)) return syntax.string_delim + escape_str(expr, syntax.string_delim) + syntax.string_delim;
    if (issymbol(expr)) return expr.symbol;
    if (isnumber(expr)) return "" + expr;
    if (isbool(expr)) return expr ? 'true' : 'false';
    if (islist(expr)) {
        if (expr.length == 0)
            return syntax.list_open + syntax.list_close;
        var rs = [];
        for (var k in expr)
            rs.push(form_to_str(expr[k], syntax));
        return syntax.list_open + rs.join(syntax.list_separator) + syntax.list_close;
    }
    if (isdict(expr)) {
        var rs = [];
        for (var k in expr)
            rs.push(form_to_str(k, syntax) + syntax.dict_kv_separator + form_to_str(expr[k], syntax));
        return syntax.dict_open + rs.join(syntax.dict_item_separator) + syntax.dict_close;
    }
    if (isfunc(expr)) {
        var rs = syntax.func_open;
        if (expr.macro)
            rs += 'macro';
        else if (expr.sform)
            rs += 'sform';
        else
            rs += 'fun';
        rs += syntax.func_separator + expr.name;
        if (expr.bindings)
            rs += syntax.func_separator + form_to_str(expr.bindings, syntax);
        switch(expr.type) {
            case 'sexpr':
                rs += syntax.func_separator + form_to_str(expr.body, syntax);
                break;
            case 'js':
                rs += " <js>";
                break;
            default:
                rs += " <?body?>";
                break;
        }
        rs += syntax.func_close;
        return rs;
    }
    return "" + expr;
}


function tostring(expr) {
    if (isstring(expr)) return expr;
    return form_to_str(expr);
}


function tolisp(expr) {
    return form_to_str(expr, lisp_syntax);
}


function tojson(expr) {
    return form_to_str(expr, json_syntax);
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


exports.isobject = isobject;
exports.isstring = isstring;
exports.issymbol = issymbol;
exports.isnumber = isnumber;
exports.strisint = strisint;
exports.isbool = isbool;
exports.isdate = isdate;
exports.istrue = istrue;
exports.isfalse = isfalse;
exports.istruthy = istruthy;
exports.isfalsy = isfalsy;
exports.isnull = isnull;
exports.islist = islist;
exports.isdict = isdict;
exports.isfunc = isfunc;
exports.isjsfunc = isjsfunc;

exports.isBooleanString = isBooleanString;
exports.isNumericString = isNumericString;

exports.tostring = tostring;
exports.tolisp = tolisp;
exports.tojson = tojson;
exports.tonum = tonum;
exports.tobool = tobool;
exports.todate = todate;

exports.sym = sym;


