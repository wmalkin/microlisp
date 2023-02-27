;;
;; man page support
;;


(progn

  
  (defun func.signature (f)
    (if (== (func.type f) 'js')
      (cat "(" (func.name f) " <bound to js>)" )
      (cat "(" (func.name f) " " (func.bindings f) ")")))
  
  
  (defun func.prt (f)
    """
    Print details of the given function, including its signature and doc string.
    """
    (prt (ansi.ctxt (func.signature f) 172))
    (prt (ansi.ctxt (func.docs f) 223)))

    
      
  ;; (man <function>) is declared as a top level function, no namespace
  (defun man (f)
    """
    Print the doc string for a function.
    """
    (cond
      ((funcp f) (func.prt f))
      ((isdict f) (ns f))
      ((isstr f) (man-grep f))
      (true (prt (red "man page not found")))))
  
  
  (defun ns-ls (namespace)
    """
    Print all of the entries in a namespace (dict of functions).
    """
    (ptable
      (values (filter-map namespace
                          (fun (itm)
                            (or (isfunc itm)
                                (and (isdict itm) (in (gdict itm 'type') (list "special-form" "operand")))))
                          (fun (itm) (if (isfunc itm)
                                         (func.table-row itm)
                                         (builtins.table-row itm)))))))


  (defun ns (namespace)
    """
    Print information about the namespace, including its doc string, and
    the doc strings of any functions found in the namespace.

    If no namespace is given, calls (nsls).
    """
    (if (isnull namespace)
        (ns-ls)
        (if (dictp namespace)
            (progn
              (prt)
              (if (has namespace "*docs*")
                  (prt (ansi.ctxt namespace.*docs* 223) "\n"))
              (ns-ls namespace)))))


  (defun man-grep (txt)
    """
    Locate docstrings that contain the given text.
    """
    (setq tf (fun (fv fk)
              (and
                (funcp fv)
                (or
                  (cont (func.docs fv) txt)
                  (cont fk txt)))))
    
    ;; todo: look for matches in namespace name or docstring
    ;; todo: look for matches in global variable names
    (foreach (ns-vars) ((nv nk)
                        (if (isdict nv)
                            (foreach nv ((fv fk)
                                         (if (tf fv fk)
                                             (prt "function:" (cat nk "." fk))))))))
    (foreach (global-funcs) ((gv gk)
                             (if (tf gv gk)
                                 (prt "function:" gk)))))


)
