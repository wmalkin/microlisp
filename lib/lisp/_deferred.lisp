;
; deferred initialization on startup
;

(progn

  (defvar _deferred_ (list))
  
  (defun _defer_ (f)
    (setq _deferred_ (append _deferred_ f)))
  
  (defun _run_deferred_ ()
    (prt "_run_deferred_" (count _deferred_))
    (prt _deferred_)
    (each _deferred_ (fun (f) (prt "run:" f) (f))))
  
)