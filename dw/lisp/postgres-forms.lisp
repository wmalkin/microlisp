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
                        (setq json-path (cat json-path " as " (last parts))))))
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
    (setq
      valstr (map val pg.quote-string)
      vallist (join valstr ", "))
    (dict 
      'stmt' (cat (pg.json-field col) " in (" vallist ")")
      'val' (list)))


  (defun pg.$= (col val)
    """
    Postgres `=` clause.
    """
    (dict 'stmt' (cat (pg.json-field col) ' = %L')
      'val' (list val)))


  (defun pg.$> (col val)
    """
    Postgres `>` clause.
    """
    (dict 'stmt' (cat (pg.json-field col) ' > %L')
      'val' (list val)))


  (defun pg.$< (col val)
    """
    Postgres `<` clause.
    """
    (dict 'stmt' (cat (pg.json-field col) ' < %L')
      'val' (list val)))


  (defun pg.$btwn (col val1 val2)
    """
    Postgres `between` clause.
    """
    (dict 'stmt' (cat (pg.json-field col) ' between %L and %L')
      'val' (list val1 val2)))


  (defun pg.$near-ts (col time interval)
    """
    Postgres `between` clause for a timestamp and time interval.
    """
    (dict 'stmt' "%s between (%L at time zone 'UTC')::timestamp - interval %L and (%L at time zone 'UTC')::timestamp + interval %L"
      'val' (list (pg.json-field col) time interval time interval)))


  (defun pg.map-join (args join-by)
    (setq args (filter-null (explode args)))
    (dict
      'stmt' (cat "(" (join (map args (fun (x) x.stmt)) (cat " " join-by " ")) ")")
      'val' (explode (map args (fun (x) x.val)))))
  
  
  (defun pg.$and ()
    """
    Postgres `and` clause for any number of child statements.
    """
    (pg.map-join __args "and"))


  (defun pg.$or ()
    """
    Postgres `or` clause for any number of child statements.
    """
    (pg.map-join __args "or"))


  (defun pg.$+ ()
    """
    Postgres `+` statement.
    """
    (pg.map-join __args "+"))


  (defun pg.$- ()
    """
    Postgres `-` clause.
    """
    (pg.map-join __args "-"))


  (defun pg.$timezone (col tz)
    """
    Postgres statement to do something to timestamps...
    """
    (dict 'stmt' "(%L at time zone %I)::timestamp"
      'val' (list (pg.json-field col) tz)))


  (defun pg.$interval (interval)
    """
    Postgres `interval` statement.
    """
    (dict 'stmt' 'interval %L'
      'val' (list interval)))


  (defun pg.$where ()
    """
    Postgres `where` statement for any number of child statements.
    """
    (if (pg.inspect)
        (block
          (prt "pg.$where")
          (insp (explode __args))))
    (fold (explode __args)
          (dict 'stmt' "where "
                'val' (list))
          (fun (m x)
           (dict 'stmt' (cat m.stmt x.stmt )
                 'val' (explode m.val x.val)))))


  (defun pg.$select ()
    """
    Postgres `select` statement.
    """
    (dict 'stmt' (cat "select " (join (pg.json-field __args true) ", "))
      'val' (list)))


  (defun pg.$from (table)
    """
    Postgres `from` statement.
    """
    (dict 'stmt' 'from %s'
      'val' (list table)))


  (defun pg.$order-by (&desc)
    """
    Postgres `order by` statement.
    """
    (dict 'stmt' 'order by %s'
      'val' (cat (join __args ',') (if desc " DESC" ""))))


  (defun pg.$group-by ()
    """
    Postgres `group by` statement.
    """
    (dict 'stmt' 'group by %s'
      'val' (join __args ',')))


  (defun pg.$join (table col1 col2)
    """
    Postgres `join` statement.
    """
    (dict 'stmt' 'join %s on %s = %s'
      'val' (list table col1 col2)))


  (defun pg.$left-join (table col1 col2)
    """
    Postgres `left join` statement.
    """
    (dict 'stmt' 'left join %s on %s = %s'
      'val' (list table col1 col2)))


  (defun pg.$limit (rows)
    """
    Postgres `limit` statement.
    """
    (dict 'stmt'
      'limit %L'
      'val' (list rows)))


  (defun pg.$insert (table)
    (dict "stmt" (cat "insert into %I (" (join (fill "%I" (count (keys __kwargs)))) ") values (" (join (fill "%L" (count (keys __kwargs)))) ") ")
          "val" (append table (keys __kwargs) (values __kwargs))))

  (defun pg.$update (table)
    (dict "stmt" (cat "update  %I set " (join (fill "%I = %L" (count (keys __kwargs)))))
          "val" (append table (explode (zipper (keys __kwargs) (values __kwargs))))))


  (defun pg.fmt-dates (va)
    """
    Format all of the returned dates in a Postgres result.
    This is required because JavaScript and Postgres do not
    agree on what a date should look like. All of the dates
    in our warehouse are bare dates (no timezone) with an
    implicit GMT timezone. JavaScript needs us to make that
    explicit.
    """
    (map va (fun (v)
             (if (isdate v)
                 (dates.short-date-gmt v)
                 v))))


  (defun pg.fold-statement ()
    """
    Fold together a set of Postgres statements into a single
    statement and values list.
    """
    (if true
        (block
          (prt "pg.fold-statement")
          (insp (explode __args))))
    (let rs (fold (explode __args)
                  (dict 'stmt' '' 'val' (list))
                  (fun (m x) (dict
                               'stmt' (cat m.stmt x.stmt " ")
                               'val' (append m.val x.val)))))
    (let rs.val (pg.fmt-dates rs.val))
    rs)


  (defun pg.fix-dates (r)
    """
    Fix the formatting of dates in a query before sending it
    to Postgres. All of the dates in our warehouse are bare
    dates without timezone, in implicit GMT zone.
    """
    (if (or (islist r) (isdict r))
        (map r ((itm) (pg.fix-dates itm)))
        (if (isdate r)
            (- r (tz-offset-ms(r)))
            r)))


)