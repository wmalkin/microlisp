;;
;; Lisp functions
;;

(progn
  
  (defsform block ()
    (apply progn ,@__args ,@__kwargs))
  
  
  (defun default (val def)
    (if (nullp val) def val))
  
  
  (defmacro ++ (sym)
    `(setq ,sym (+ ,sym 1)))
  
  
  (defmacro -- (sym)
    `(setq ,sym (- ,sym 1)))
  
  
  (defun lead0 (n digits)
    (setq digits (default digits 2))
    (setq rs (tostr n))
    (while (< (count rs) digits)
           (setq rs (cat '0' rs)))
    rs)
  
  
  (defun nowms () (date-in-ms (now)))
  
  
  (defun mdict ()
    (setq rs (dict))
    (each __args (fun (d)
                   (each d (fun (v k)
                             (put rs k v)))))
    rs)

)

