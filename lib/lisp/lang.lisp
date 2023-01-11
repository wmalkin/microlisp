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
  
  
  (defun filter-null (m) (filter m (fun (m1) (not (nullp m1)))))

  
  (defun zipper ()
    (setq
      zip-args __args
      max-cnt (max (map __args (fun (lst) (count lst)))))
    (map (seq max-cnt)
         (fun (i) (map zip-args (fun (lst) (get lst i))))))

)

