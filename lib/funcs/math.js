//
// additionl math builtins defined
//


module.exports = {};


const func = require("../core/func.js"),
      util = require("../core/util.js");


function $add(args, scope) {
    var result = 0;
    for (var i = 0; i < args.length; i++)
        result += args[i];
    return result;
}


function $sub(args, scope) {
    var result = 0;
    if (args.length) {
        result = args[0];
        for (var i = 1; i < args.length; i++)
            result -= args[i];
    }
    return result;
}


function $mul(args, scope) {
    var result = 0;
    if (args.length) {
        result = args[0];
        for (var i = 1; i < args.length; i++)
            result *= args[i];
    }
    return result;
}


function $div(args, scope) {
    var result = 0;
    if (args.length) {
        result = args[0];
        for (var i = 1; i < args.length; i++)
            if (args[i])
                result /= args[i];
    }
    return result;
}


function $mod(args, scope) {
    if (args.length == 2) {
        var n = util.tonum(args[0]),
            m = util.tonum(args[1]);
        if (m != 0)
            return n % m;
    }
    return null;
}


function $sum(args, scope) {
    var sum = 0;
    for (var i = 0; i < args.length; i++) {
        var a = args[i];
        if (util.islist(a)) {
            for (var j = 0; j < a.length; j++)
                sum += a[j];
        } else {
            sum += util.tonum(a);
        }
    }
    return sum;
}


function $abs(args, scope) {
    return Math.abs(util.tonum(args[0]));
}


function $sign(args, scope) {
    var n = util.tonum(args[0]);
    if (n < 0)
        return -1;
    if (n > 0)
        return 1;
    return 0;
}


function $chs(args, scope) {
    return -util.tonum(args[0]);
}


function $inv(args, scope) {
    var n = util.tonum(args[0]);
    if (n != 0)
        return 1.0 / n;
    return 0;
}


function $pow(args, scope) {
    return Math.pow(util.tonum(args[0]), util.tonum(args[1]));
}


function $ceil(args, scope) {
    return Math.ceil(util.tonum(args[0]));
}


function $floor(args, scope) {
    return Math.floor(util.tonum(args[0]));
}


function $pi(args, scope) {
    return Math.PI;
}


function $e(args, scope) {
    return Math.E;
}


function $sin(args, scope) {
    return Math.sin(util.tonum(args[0]));
}


function $cos(args, scope) {
    return Math.cos(util.tonum(args[0]));
}


function $tan(args, scope) {
    return Math.tan(util.tonum(args[0]));
}


function $asin(args, scope) {
    return Math.asin(util.tonum(args[0]));
}


function $acos(args, scope) {
    return Math.acos(util.tonum(args[0]));
}


function $atan(args, scope) {
    return Math.atan(util.tonum(args[0]));
}


function $sqrt(args, scope) {
    return Math.sqrt(util.tonum(args[0]));
}


function $exp(args, scope) {
    return Math.exp(util.tonum(args[0]));
}


function $log(args, scope) {
    return Math.log(util.tonum(args[0]));
}


function $log10(args, scope) {
    return Math.log(util.tonum(args[0])) / Math.log(10.0);
}


function $trunc(args, scope) {
    return Math.trunc(util.tonum(args[0]));
}


function $round(args, scope) {
    return Math.round(util.tonum(args[0]));
}


function $rand(args, scope) {
    if (args.length == 0)
        return Math.random();
    if (args.length == 1)
        return Math.floor(Math.random() * util.tonum(args[0]));
    if (args.length == 2) {
        var min = util.tonum(args[0]);
        var max = util.tonum(args[1]);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    return null;
}


function $rad(args, scope) {
    return args[0] * Math.PI / 180.0;
}


function $deg(args, scope) {
    return args[0] * 180.0 / Math.PI;
}



func.def({ name: "+", body: $add });
func.def({ name: "-", body: $sub });
func.def({ name: "*", body: $mul });
func.def({ name: "/", body: $div });
func.def({ name: "mod", body: $mod });
func.def({ name: "sum", body: $sum });

func.def({ name: "abs", body: $abs });
func.def({ name: "sign", body: $sign });
func.def({ name: "chs", body: $chs });
func.def({ name: "inv", body: $inv });
func.def({ name: "pow", body: $pow });

func.def({ name: "ceil", body: $ceil });
func.def({ name: "floor", body: $floor });
func.def({ name: "trunc", body: $trunc });
func.def({ name: "round", body: $round });

func.def({ name: "pi", body: $pi });
func.def({ name: "e", body: $e });
func.def({ name: "deg", body: $deg });
func.def({ name: "rad", body: $rad });
func.def({ name: "sin", body: $sin });
func.def({ name: "cos", body: $cos });
func.def({ name: "tan", body: $tan });
func.def({ name: "asin", body: $asin });
func.def({ name: "acos", body: $acos });
func.def({ name: "atan", body: $atan });
func.def({ name: "sqrt", body: $sqrt });
func.def({ name: "exp", body: $exp });
func.def({ name: "log", body: $log });
func.def({ name: "log10", body: $log10 });

func.def({ name: "rand", body: $rand });


