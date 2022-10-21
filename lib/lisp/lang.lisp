;;
;; Lisp functions
;;

(progn
  
  (defun default (val def)
    (if (nullp val) def val))
  
  
  (defun lead0 (n digits)
    (let digits (default digits 2))
    (let rs (tostr n))
    (while (< (count rs) digits)
           (let rs (cat '0' rs)))
    rs)

)

