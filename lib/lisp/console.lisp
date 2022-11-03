;;
;; table printing wrapper functions
;;

(progn
  
  
  (defun table.column-form (data)
    (if (dictp data) data (dict 'name' data)))
  
  
  (defun table.prt (data &cols &title &sort)
    (let tdata (dict))
    (put tdata 'rows' data)
    (if cols (put tdata 'columns' cols))
    (if sort (put tdata 'sort' sort))
    (if title (put tdata 'title' title))
    (table.print tdata))
  
)