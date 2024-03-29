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
    """
    Zipper together any number of lists into a list of tuples.
    Pad out tuples with null if the input lists are different lengths.
    """
    (setq
      zip-args __args
      max-cnt (max (map __args (fun (lst) (count lst)))))
    (map (seq max-cnt)
         (fun (i) (map zip-args (fun (lst) (get lst i))))))


  (defun cmap (f)
    """
    Clojure-style map where the first argument is a function
    to map over all the remaining arguments. If there is one
    additional argument, return the mapped value directly. If
    there are multiple arguments, return a list of mapped results.
    """
    (if (> (count __args) 1)
      (map __args (fun (coll) (cmap f coll)))
      (map (first __args) f)))
  
  
  (setq timer.units (dict
                      "ms" 1
                      "millisecond" 1
                      "milliseconds" 1
                      "s" 1000
                      "second" 1000
                      "seconds" 1000
                      "m" 60000
                      "minute" 60000
                      "minutes" 60000))
  
  
  (defmacro timer.every ()
    (insp __args)
    (setq argn 0 n 1 unit 1)
    (if (nump (get __args argn))
        (setq n (get __args argn) argn (+ 1 argn)))
    (if (has timer.units (tostr (get __args argn)))
        (setq unit (get timer.units (tostr (get __args argn))) argn (+ 1 argn)))
    (setq body (slice __args argn))
    `(timer.interval (* ,n ,unit) ,*body))

)

