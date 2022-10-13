//
// unit tests
//

module.exports = {};


const ea = require("./ea.js"),
      func = require("./func.js");


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


function assert(str, exp) {
  if (exp == null)
    exp = true;
  var act = ea.eval_str(str);
  asserttest(exp, act, str);
}


function prep(str) {
  ea.eval_str(str);
}


function sform$fassert(args, scope) {
  var exp = ea.eval_sexpr(args[0], scope),
    act = ea.eval_sexpr(args[1], scope);
  asserttest(exp, act, args[0]);
}


function test_main(args, scope) {
  test.asserted = 0;
  test.failed = 0;

  assert("(+ 1 2 3)", 6);
  assert("(* 1 2 3)", 6);
  assert("(/ 120 4 3)", 10);
  assert("(- 100 10 10 5)", 75);
  assert("(mod 100 21)", 16);
  assert("(sum 1 2 3)", 6);
  assert("(sum (list 1 2 3))", 6);
  assert("(sum 1 (list 2) 3)", 6);

  assert("(abs 111)", 111);
  assert("(abs -5)", 5);
  assert("(abs 0)", 0);
  assert("(sign 2)", 1);
  assert("(sign 0)", 0);
  assert("(sign -2)", -1);
  assert("(chs 2)", -2);
  assert("(chs 0)", 0);
  assert("(chs -2)", 2);

  assert("(ceil 1)", 1);
  assert("(ceil 1.1)", 2);
  assert("(ceil -1.1)", -1);
  assert("(floor 1)", 1);
  assert("(floor 1.1)", 1);
  assert("(floor -1.1)", -2);
  assert("(round 1)", 1);
  assert("(round 1.1)", 1);
  assert("(round -1.1)", -1);
  assert("(round 1.5)", 2);
  assert("(round -1.5)", -1);
  assert("(round 1.9)", 2);
  assert("(round -1.9)", -2);
  assert("(trunc 1)", 1);
  assert("(trunc 1.1)", 1);
  assert("(trunc -1.1)", -1);
  assert("(trunc 1.5)", 1);
  assert("(trunc -1.5)", -1);
  assert("(trunc 1.9)", 1);
  assert("(trunc -1.9)", -1);

  assert("(sin 0)", 0);
  assert("(sin (/ (pi) 2))", 1);
  assert("(sin (pi))", 0);
  assert("(sin (* (pi) 1.5))", -1);

  assert("(cos 0)", 1);
  assert("(cos (/ (pi) 2))", 0);
  assert("(cos (pi))", -1);
  assert("(cos (* (pi) 1.5))", 0);

  assert("(cos 0)", 1);
  assert("(cos (/ (pi) 2))", 0);
  assert("(cos (pi))", -1);
  assert("(cos (* (pi) 1.5))", 0);

  assert("(tan (/ (pi) 4))", 1);
  assert("(> (tan (/ (pi) 2)) 1000000000)");

  assert("(deg (pi))", 180);
  assert("(/ (rad 45) (pi))", 0.25);

  assert("(asin 0)", 0);
  assert("(asin (0.5))", 0);
  assert("(asin 0)", 0);
  assert("(asin 0)", 0);

  assert("(== 1 1)");
  assert("(!= 1 2)");
  assert("(== 1 '1')");
  assert("(< 1 2)");
  assert("(< 2 1)", false);
  assert("(> 5 1)");
  assert("(<= 5 5)");
  assert("(<= 5 6)");
  assert("(<= 5 4)", false);
  assert("(>= 6 5)");
  assert("(>= 6 6)");
  assert("(>= 5 6)", false);

  assert("(and true false)", false);
  assert("(and true true 1)", true);
  assert("(or true false)", true);
  assert("(or false 0 false)", false);

  assert("(if true 1 2)", 1);
  assert("(if false 1 2)", 2);
  assert("(if (> 1 2) 1 2)", 2);

  assert("(progn (+ 1 2) (+ 2 3) (+ 3 4))", 7);
  assert("(progn (let a 50 b 100) (/ b a))", 2);

  assert("(funcp (defun foo (a) (+ 1 2)))");
  assert("(funcp foo)");

  assert("(cat 'foo' 123 'bar')",'foo123bar');
  assert("(upper 'doGs')",'DOGS');
  assert("(lower 'doGs')",'dogs');
  assert("(starts 'doGs' 'do')");
  assert("(ends 'doGs' 'Gs')");
  assert("(cont 'doGs' 'G')");
  assert("(count (split '1,2,3' ','))", 3);
  assert("(substr 'cats-and-dogs' 5 3)",'and');
  assert("(substr 'cats-and-dogs' 8)",'-dogs');
  assert("(repl 'cats-and-dogs' 'cat' 'dog')",'dogs-and-dogs');
  assert("(repl 'cats-and-dogs' 'a' '@')",'c@ts-@nd-dogs');
  assert("(charcode 'a')",97);
  assert("(fromcharcode 65)",'A');
  assert("(padleft 'foo' 8)",'     foo');
  assert("(padleft 'foo' 8 '*')",'*****foo');
  assert("(padright 'foo' 8)",'foo     ');
  assert("(trim '  foo bar  ')",'foo bar');

  assert("(idxof 'cats-and-dogs' 'a')", 1);
  assert("(idxof 'cats-and-dogs' 'an')", 5);
  assert("(lastidxof 'cats-and-dogs' 'a')", 5);
  assert("(lastidxof 'cats-and-dogs' '-')", 8);

  assert("(starts 'cats-and-dogs' '-')", false);
  assert("(starts 'cats-and-dogs' 'cat')", true);
  assert("(ends 'cats-and-dogs' '-')", false);
  assert("(ends 'cats-and-dogs' 'dogs')", true);
  assert("(cont 'cats-and-dogs' 'dogs')", true);
  assert("(cont 'cats-and-dogs' ' and ')", false);
  assert("(cont 'cats-and-dogs' 'and')", true);

  assert("(count (split '1,2,3,4,5'))", 5);
  assert("(count (split '123,,,123'))", 4);
  assert("(count (split '123,,,123' '2'))", 3);

  assert("(upper 'AabBcC')",'AABBCC');
  assert("(lower 'AabBcC')",'aabbcc');
  assert("(upper 'èÉâü')",'ÈÉÂÜ');

  assert("(join (keys (dict a 1 b 2 c 3)))", 'a,b,c');

  assert("(first (list 1 2 3))",1);
  assert("(last (list 1 2 3))",3);
  assert("(count (rest (list 1 2 3)))",2);
  assert("(first (rest (list 1 2 3)))",2);
  assert("(last (prune (list 1 2 3 4 5)))",4);

  prep("(let mylist (list 1 2))");
  prep("(push mylist 33)");

  prep("(defun fib (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2)))))");
  assert("(fib 5)",8);
  assert("(fib 12)", 233);

  assert("(progn (let total 0) (for (i 1 100) (let total (+ total i))) total)", 4950);
  assert("(progn (let total 0) (for (i 1 100 2) (let total (+ total i))) total)", 2500);

  // cond
  prep("(defun esign (x) (cond ((< x -9) 'way less') ((< x 0) 'less') ((> x 0) 'more') 'zero'))");
  assert("(esign -1)", 'less');
  assert("(esign -10)", 'way less');
  assert("(esign -100)", 'way less');
  assert("(esign 1)", 'more');
  assert("(esign 10)", 'more');
  assert("(esign 0)", 'zero');


  // slice
  // splice

  console.log("tested:", test.asserted, ", failed:", test.failed);
}


function init() {
  func.def({ name:"test", bindings:null, body:test_main });
  func.def({ name:"assert", bindings:null, body:sform$fassert });
}


module.exports.init = init;

