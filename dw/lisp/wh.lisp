;;
;; Data warehouse query forms
;;

(progn

  (defun wh.otr-query (&from &limit)
    (pg.fold-statement 
      (pg.$select "event")
      (pg.$from (default from "events.otr_events"))
      (pg.$where
        (pg.$and __args))
      (pg.$order-by "server_timestamp")
      (pg.$limit (default limit 1000))))
  
  
  (defun wh.partition (yyyy mm)
    (cat "part.otr_events_" yyyy "_" (lead0 mm)))
  
  
  (defun wh.otr ()
    (setq query (otr-query *__args *__kwargs))
    (pg.run "datalake" query.stmt query.val))
  

  (defun wh.otr-partition (yyyy mm)
    (setq query (otr-query &from (wh.partition yyyy mm) *__args *__kwargs))
    (pg.run "datalake" query.stmt query.val))
  
  
  (defun wh.$t ()
    """
    Return a Postgres where clause with a time filter.
    Calls (mongo.$t) to parse the time parameters, then converts
    the resulting date range into a Postgres expression on
    server_timestamp.
    """
    (insp *__args *__kwargs)
    (setq mts (mongo.$t *__args))
    (if mts.ts.$gt
        (if mts.ts.$lt
            (pg.$btwn "server_timestamp" mts.ts.$gt mts.ts.$lt)
            (pg.$> "server_timestamp" mts.ts.$gt))
        (pg.$< "server_timestamp" mts.ts.$lt)))
  
  
  (defun wh.is-or-in (col val)
    (if (listp val)
        (pg.$in col val)
        (pg.$= col val)))
  
  
  (defun wh.$v (vid)
    """
    Returns a Postgres where clause for context.vehicleId.
    """
    (wh.is-or-in "event.context.vehicleId" vid))
  
)