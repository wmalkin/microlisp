;;
;; Lisp functions
;;

(progn
  
  (defun default (val def)
    (if (nullp val) def val))
  
  
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
  
  
  ;; experiment with moving some builtins to macros
  (defmacro @cliphead (m n)
    `(slice ,m (max 0 (- (count ,m) ,n))))
  
  (defmacro @setclip (m n)
    `(setq ,m (@cliphead ,m ,n)))

)

