;;
;; mongo drivewyze forms
;;

(progn
  
  (defun dates.parse-start-time (tr)
    (if (nullp tr)
        (dates.now-minus-ms dates.multipliers.d)
        (with (
               time-value (substr tr 0 (- (count tr) 1))
               time-unit (substr tr -1))
              (if  (not (nullp (get dates.multipliers time-unit)))
                  (dates.now-minus-units time-value time-unit)
                  (todate tr)))))


  (defun dates.parse-end-time (start-time dur)
    (with (
           time-value (substr dur 0 (- (count dur) 1))
           time-unit (substr dur -1))
          (if (not (nullp (get dates.multipliers time-unit)))
              (dates.base-plus-units (dates.parse-start-time start-time) time-value time-unit)
              (todate dur))))

  
  (defun mongo.$Q ()
    """
    $Q accepts any number of arguments, each of which should be a valid
    find clause for mongo.find. It combines all of the clauses and
    returns a single dict that contains all of the find criteria.
    
    $Q can process individual clauses (dict) or lists of clauses.
    """
    (progn
      (setq rs (dict))
      (each __args (fun (clause)
                     (progn
                       (if (funcp clause)
                           (setq clause (clause clause)))
                       (if (dictp clause)
                           (each clause (fun (v k) (put rs k v))))
                       (if (listp clause)
                           (each clause (fun (clause2) (setq rs (mongo.$Q rs clause2))))))))
      rs))
  
  
  (defun mongo.$attr (attrid pattrid args)
    (dict attrid (is-or-in args)))
  
  
  (defun mongo.$attrpair (id1 id2 v1 v2)
    (progn
      (setq rs (dict))
      (if (not (isnull v1)) (sdict rs id1 v1))
      (if (not (isnull v2)) (sdict rs id2 v2))
      rs))

  
  (defun mongo.$t (time-range time-end &key)
    """
    $t accepts a variety of time specifications, and returns a mongo
    or postgres event time filter.

    The first parameter to $t can be either a date-time value that
    represents the start of the time range, or a time-span value
    that represents the start as the given span before the current
    time.

    The second parameter to $t can be either a date-time value that
    represents the end of the time range, or a time-span value
    that represents the end as the given span after the start.

    ($t '1d') => the period starting one day before now
    ($t '1w') => the period starting one week before now
    ($t '7d,2d') => the two day period starting 7 days ago
    ($t '2021-01-01,7d') => the week starting Jan 1st 2021
    ($t '2021-01-01,2021-02-01') => the month of January 2021

    Some time spans are predefined as global variables so they do
    not have to be quoted when used alone.

    ($t 1d) => the last day
    ($t 30d) => the last 30 days
    ($t 2h) => the last 2 hours

    Time spans are a number followed by a unit:
    5s: 5 seconds
    10m: 10 minutes
    4h: 4 hours
    2d: 2 days
    1w: 1 week
    """
    (setq key (default key 'ts'))
    (if (nullp time-end)
        (setq
          time-parts (split time-range ',')
          start  time-parts.0
          end time-parts.1)
        (setq start time-range
          end time-end))
    (setq mongo-range (dict '$gt' (dates.parse-start-time start)))
    (if end (setq mongo-range.$lt (dates.parse-end-time start end)))
    (dict key mongo-range))
  
  
  
  )

