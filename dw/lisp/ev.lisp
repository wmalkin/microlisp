;;
;; Namespace: ev
;; Function to load and display vehicle events from mongo or postgres
;;

(progn

  (defun ev.mongo.le ()
    (prt (mongo.$Q *__args))
    (setq ev._events
      (mongo.find _env 'events'
                  (mongo.$Q *__args)
                  *__kwargs))
    (count ev._events))
  
  
  (defun ev.le (time-range)
    (setq ev._events 
          (wh.otr 
            (wh.$t (default time-range "1d")) 
            *__args *__kwargs))
    (count ev._events))
  
  
  (defun ev.lev (vid time-range)
    (ev.le time-range (wh.$v vid) *__args *__kwargs))
  
  
  (defun ev.format.et (itm)
    (cat
      (default itm.event.eventType "")
      (if (nullp itm.event.trigger) "" (cat ':' itm.event.trigger))
      (if (nullp itm.event.scrn) "" (cat ',' itm.event.scrn))
      (if (nullp itm.event.action) "" (cat ',' itm.event.action))))
  
  
  (defun ev.format.gps (loc)
    (cat '[' (tofixed loc.1 6) ' ' (tofixed loc.0 6) ' ' (tofixed loc.2 1) ' ' (tofixed loc.3 1) ']'))
  
  
  (defun ev.format.loc (itm)
    (if (listp itm.event.loc)
        (if (listp (first itm.event.loc))
            (cat (ev.format.gps itm.event.loc.0) ' (' (count itm.event.loc) ')')
            (ev.format.gps itm.event.loc))
        ""))
  
  
  (defun ev.format.transit (itm)
    (if (and itm.ts itm.event.TS)
        (dates.fmt-timespan (- (tonum itm.ts) (tonum (substr itm.event.TS 0 13))))))
  
  
  (defun ev.format.drift (itm)
    (with (ts (tonum (substr itm.event.TS 0 13)) gps itm.event.loc)
          (if (and ts gps)
              (progn
                (if (listp (first gps))
                    (setq gps (first fps)))
                (cat (tofixed (/ (- gps.4 (tonum ts)) 1000) 1) 's'))
              "")))
  
  
  (setq ev.default-colmap
        (dict
          'Idx' (fun (itm i) i)
          'vehicleId' (fun (itm) itm.context.vehicleId)
          'serverISO' (fun (itm) (dates.short-date-gmt itm.ts))
          'deviceISO' (fun (itm) (dates.short-date-gmt (tonum (substr itm.event.TS 0 13))))
          'transit' ev.format.transit
          'drift' ev.format.drift
          'event-type' ev.format.et
          'evgid' (fun (itm) (default itm.event.evgid ""))
          'gps' ev.format.loc
          'site' (fun (itm) (default itm.fence.loc ""))))
  
  
  (defun ev.colmap ()
    (setq cm (dict))
    (each __args (fun (m)
                   (setq cols (keys m))
                   
                   (each m (fun (val key)
                             (if (nullp val)
                                 (delete cm key)
                                 (put cm key val))))))
    cm)
  
  
  (defun ev.map-veh-events (from to)
    (setq colmap (ev.colmap ev.default-colmap __kwargs))
    (setq columns (list))
    (each colmap (fun (v k) (setq columns (append columns (dict "name" k "alignment" "left")))))
    (dict
      'colmap' colmap
      'columns' columns
      'rows' (map ev._events (fun (itm index)
                               (setq row (dict))
                               (each colmap (fun (f key) (put row key (f itm index))))
                               row))))
  
  
  (defun ev.el (from to)
    (with (data (ev.map-veh-events *__kwargs))
          (table.print &rows data.rows &columns data.columns)))
  
  
  (defun ev.pe (idx)
    (insp (get ev._events idx)))
  

  (defun ev.pev (idx)
    (insp (get (get ev._events idx) "event")))
  
  
  (defun ev.track (idx)
    (table.print 
      &rows (map 
              (get (get ev._events idx) "event.loc") 
              (fun (p) (dict
                         'lat' p.1
                         'long' p.0
                         'bearing' p.2
                         'speed' p.3
                         'timestamp' p.4)))))
  
  
  ;; aliases for less typing...
  (defmacro le () `(ev.le ,*__args ,*__kwargs))
  (defmacro lev () `(ev.lev ,*__args ,*__kwargs))
  (defmacro el () `(ev.el ,*__args ,*__kwargs))
  (define-symbol-macro ee ev._events)

)

