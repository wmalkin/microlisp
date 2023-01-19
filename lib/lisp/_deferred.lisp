;
; deferred initialization on startup
;

(progn

  (defvar _deferred_ (list))
  
  (defun _defer_ (f)
    (setq _deferred_ (append _deferred_ f)))
  
  (defun _run_deferred_ ()
    (each _deferred_ (fun (f) (f))))
  
  
  (defun __start__ ()
    (prt "*************************")
    (prt "*       microlisp       *")
    (prt "*    ©2023 Drivewyze    *")
    (prt "*************************")
    (_run_deferred_))
  
)