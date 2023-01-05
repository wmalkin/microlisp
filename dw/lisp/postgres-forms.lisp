;;
;; postgres query forms
;;

(progn

  (defun pg.db (name) (get pgsql-connection-strings name))


  (defun pg.run (db query values)
    (postgres.run (pg.db db) query values))
  
  
  (defun pg.json-field (path with-as)
    (if (listp path)
        (map path (fun (p) (pg.json-field p with-as)))
        (progn
          (let
            parts (split path '.')
            part-count (count parts))
          (setq json-path (first parts))
          (if (> part-count 2)
              (each (prune (rest parts))
                    (fun (itm) 
                      (if (== (tostr (tonum itm)) itm)
                          (setq json-path (cat json-path " -> " itm))
                          (setq json-path (cat json-path " -> '" itm "'"))))))
          (if (gt part-count 1)
              (progn
                (if (== (tostr (tonum (last parts))) (last parts))
                    (setq json-path (cat json-path " ->> " (last parts)))
                    (setq json-path (cat json-path " ->> '" (last parts) "'")))
                (if with-as
                    (setq json-path (cat json-path " as " (last parts))))))
          json-path)))


)