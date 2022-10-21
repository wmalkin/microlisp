;;
;; binary-coded-decimal messing about
;;

(progn

  (defun bcdadd (a b)
    (let carry 0
      total ""
      ai (- (count a) 1)
      bi (- (count b) 1))
    (while (or (>= ai 0) (>= bi 0) (> carry 0))
           (progn
             (let digit (+ carry
                           (if (>= ai 0) (tonum (substr a ai 1)) 0)
                           (if (>= bi 0) (tonum (substr b bi 1)) 0))
               total (cat (mod digit 10) total)
               carry (trunc (/ digit 10))
               ai (- ai 1)
               bi (- bi 1))))
    total)
  
  
  (defun bcdfib (n)
    (let a "1" b "1")
    (for (i n) (progn
         (let c (bcdadd a b)
           a b
           b c)))
    c)
  
  
)