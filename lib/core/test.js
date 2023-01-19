//
// unit tests
//

const ea = require("./ea.js"),
      func = require("./func.js"),
      util = require("./util.js");


var test = {};


function asserttest(exp, act, assertion) {
    test.asserted++;
    if (util.isnumber(exp))
        exp = Math.round(exp*1000000)/1000000;
    if (util.isnumber(act))
        act = Math.round(act*1000000)/1000000;
    if (act != exp) {
        test.failed++;
        console.log("assertion failed: ", assertion)
        console.log("   expected:", exp);
        console.log("   actual:  ", act);
    }
}


async function assert(str, exp) {
    if (exp == null)
        exp = true;
    var act = await ea.streval(str);
    asserttest(exp, act, str);
}


async function prep(str) {
    await ea.streval(str);
}


async function $assert(args, scope) {
    var exp = await ea.eval(args[0], scope),
        act = await ea.eval(args[1], scope);
    asserttest(exp, act, args[0]);
}


async function $test(args, scope) {
    test.asserted = 0;
    test.failed = 0;

    await assert("(+ 1 2 3)", 6);
    await assert("(* 1 2 3)", 6);
    await assert("(/ 120 4 3)", 10);
    await assert("(- 100 10 10 5)", 75);
    await assert("(mod 100 21)", 16);
    await assert("(sum 1 2 3)", 6);
    await assert("(sum (list 1 2 3))", 6);
    await assert("(sum 1 (list 2) 3)", 6);

    await assert("(abs 111)", 111);
    await assert("(abs -5)", 5);
    await assert("(abs 0)", 0);
    await assert("(sign 2)", 1);
    await assert("(sign 0)", 0);
    await assert("(sign -2)", -1);
    await assert("(chs 2)", -2);
    await assert("(chs 0)", 0);
    await assert("(chs -2)", 2);

    await assert("(ceil 1)", 1);
    await assert("(ceil 1.1)", 2);
    await assert("(ceil -1.1)", -1);
    await assert("(floor 1)", 1);
    await assert("(floor 1.1)", 1);
    await assert("(floor -1.1)", -2);
    await assert("(round 1)", 1);
    await assert("(round 1.1)", 1);
    await assert("(round -1.1)", -1);
    await assert("(round 1.5)", 2);
    await assert("(round -1.5)", -1);
    await assert("(round 1.9)", 2);
    await assert("(round -1.9)", -2);
    await assert("(trunc 1)", 1);
    await assert("(trunc 1.1)", 1);
    await assert("(trunc -1.1)", -1);
    await assert("(trunc 1.5)", 1);
    await assert("(trunc -1.5)", -1);
    await assert("(trunc 1.9)", 1);
    await assert("(trunc -1.9)", -1);

    await assert("(sin 0)", 0);
    await assert("(sin (/ (pi) 2))", 1);
    await assert("(sin (pi))", 0);
    await assert("(sin (* (pi) 1.5))", -1);

    await assert("(cos 0)", 1);
    await assert("(cos (/ (pi) 2))", 0);
    await assert("(cos (pi))", -1);
    await assert("(cos (* (pi) 1.5))", 0);

    await assert("(cos 0)", 1);
    await assert("(cos (/ (pi) 2))", 0);
    await assert("(cos (pi))", -1);
    await assert("(cos (* (pi) 1.5))", 0);

    await assert("(tan (/ (pi) 4))", 1);
    await assert("(> (tan (/ (pi) 2)) 1000000000)");

    await assert("(deg (pi))", 180);
    await assert("(/ (rad 45) (pi))", 0.25);

    await assert("(asin 0)", 0);
    await assert("(asin (0.5))", 0);
    await assert("(asin 0)", 0);
    await assert("(asin 0)", 0);

    await assert("(== 1 1)");
    await assert("(!= 1 2)");
    await assert("(== 1 '1')");
    await assert("(< 1 2)");
    await assert("(< 2 1)", false);
    await assert("(> 5 1)");
    await assert("(<= 5 5)");
    await assert("(<= 5 6)");
    await assert("(<= 5 4)", false);
    await assert("(>= 6 5)");
    await assert("(>= 6 6)");
    await assert("(>= 5 6)", false);

    await assert("(and true false)", false);
    await assert("(and true true 1)", true);
    await assert("(or true false)", true);
    await assert("(or false 0 false)", false);

    await assert("(if true 1 2)", 1);
    await assert("(if false 1 2)", 2);
    await assert("(if (> 1 2) 1 2)", 2);

    await assert("(progn (+ 1 2) (+ 2 3) (+ 3 4))", 7);
    await assert("(progn (let a 50 b 100) (/ b a))", 2);

    await assert("(funcp (defun foo (a) (+ 1 2)))");
    await assert("(funcp foo)");

    await assert("(cat 'foo' 123 'bar')",'foo123bar');
    await assert("(upper 'doGs')",'DOGS');
    await assert("(lower 'doGs')",'dogs');
    await assert("(starts 'doGs' 'do')");
    await assert("(ends 'doGs' 'Gs')");
    await assert("(cont 'doGs' 'G')");
    await assert("(count (split '1,2,3' ','))", 3);
    await assert("(substr 'cats-and-dogs' 5 3)",'and');
    await assert("(substr 'cats-and-dogs' 8)",'-dogs');
    await assert("(repl 'cats-and-dogs' 'cat' 'dog')",'dogs-and-dogs');
    await assert("(repl 'cats-and-dogs' 'a' '@')",'c@ts-@nd-dogs');
    await assert("(charcode 'a')",97);
    await assert("(fromcharcode 65)",'A');
    await assert("(padleft 'foo' 8)",'     foo');
    await assert("(padleft 'foo' 8 '*')",'*****foo');
    await assert("(padright 'foo' 8)",'foo     ');
    await assert("(trim '  foo bar  ')",'foo bar');

    await assert("(idxof 'cats-and-dogs' 'a')", 1);
    await assert("(idxof 'cats-and-dogs' 'an')", 5);
    await assert("(lastidxof 'cats-and-dogs' 'a')", 5);
    await assert("(lastidxof 'cats-and-dogs' '-')", 8);

    await assert("(starts 'cats-and-dogs' '-')", false);
    await assert("(starts 'cats-and-dogs' 'cat')", true);
    await assert("(ends 'cats-and-dogs' '-')", false);
    await assert("(ends 'cats-and-dogs' 'dogs')", true);
    await assert("(cont 'cats-and-dogs' 'dogs')", true);
    await assert("(cont 'cats-and-dogs' ' and ')", false);
    await assert("(cont 'cats-and-dogs' 'and')", true);

    await assert("(count (split '1,2,3,4,5'))", 5);
    await assert("(count (split '123,,,123'))", 4);
    await assert("(count (split '123,,,123' '2'))", 3);

    await assert("(upper 'AabBcC')",'AABBCC');
    await assert("(lower 'AabBcC')",'aabbcc');
    await assert("(upper 'èÉâü')",'ÈÉÂÜ');

    await assert("(join (keys (dict a 1 b 2 c 3)))", 'a,b,c');

    await assert("(first (list 1 2 3))",1);
    await assert("(last (list 1 2 3))",3);
    await assert("(count (rest (list 1 2 3)))",2);
    await assert("(first (rest (list 1 2 3)))",2);
    await assert("(last (prune (list 1 2 3 4 5)))",4);

    await prep("(let mylist (list 1 2))");
    await prep("(push mylist 33)");

    await prep("(defun fib (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2)))))");
    await assert("(fib 5)",8);
    await assert("(fib 12)", 233);

    await assert("(progn (let total 0) (for (i 1 100) (let total (+ total i))) total)", 4950);
    await assert("(progn (let total 0) (for (i 1 100 2) (let total (+ total i))) total)", 2500);

    // cond
    await prep("(defun esign (x) (cond ((< x -9) 'way less') ((< x 0) 'less') ((> x 0) 'more') 'zero'))");
    await assert("(esign -1)", 'less');
    await assert("(esign -10)", 'way less');
    await assert("(esign -100)", 'way less');
    await assert("(esign 1)", 'more');
    await assert("(esign 10)", 'more');
    await assert("(esign 0)", 'zero');


    // slice
    // splice

    console.log("tested:", test.asserted, ", failed:", test.failed);
}


exports.$test = $test;
exports.$assert = $assert;


