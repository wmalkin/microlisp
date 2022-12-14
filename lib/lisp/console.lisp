;;
;; table printing wrapper functions
;;

(progn
  
  
  (defun table.column-form (data)
    (if (dictp data) data (dict 'name' data)))
  
  
  (defun table.prt (data &cols &title &sort)
    (setq tdata (dict))
    (put tdata 'rows' data)
    (if cols (put tdata 'columns' cols))
    (if title (put tdata 'title' title))
    (if sort (put tdata 'sort' sort))
    (table.print tdata))
  
)
