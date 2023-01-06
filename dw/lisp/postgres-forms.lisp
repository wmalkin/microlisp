;;
;; postgres query forms
;;

(progn

  (defun pg.db (name) (get pgsql-connection-strings name))


  (defun pg.run (db query values)
    (postgres.run (pg.db db) query values))
  
  
  (defun pg.quote-string (m)
    (if (nump m) m (cat "'" m "'")))
  
  
  (defun pg.json-field (path with-as)
    (if (listp path)
        (map path (fun (p) (pg.json-field p with-as)))
        (with (parts (split path '.')
               part-count (count parts)
               json-path (first parts))
              (each (prune (rest parts))
                    (fun (itm) (setq json-path (cat json-path " -> " (pg.quote-string itm)))))
              (if (gt part-count 1)
                  (progn
                    (setq json-path (cat json-path " ->> " (pg.quote-string (last parts))))
                    (if with-as
                        (setq json-path (cat json-path " as " with-as)))))
        json-path)))

  
  (defun pg.$like (col val)
    """
    Postgres `like` clause.
    """
    (dict 'stmt' (cat (pg.json-field col) ' like %L')
      'val' (list val)))
  

  (defun pg.$starts (col val)
    (pg.$like col (cat val "%")))


  (defun pg.$in (col val)
    """
    Postgres `in` clause.
    """
    (let
      valstr (map val ((v) (if (isnum v) v (cat "'" v "'"))))
      vallist (join valstr ", "))
    (dict 
      'stmt' (cat (pg.json-field col) " in (" vallist ")")
      'val' (list)))


)