;;
;; Namespace: ev
;; Function to load and display vehicle events from mongo or postgres
;;

(progn

  (defun ev.load ()
    (prt (mongo.$Q *__args))
    (setq ev._events
      (mongo.find _env 'events'
                  (mongo.$Q *__args)
                  *__kwargs))
    (count ev._events))
  
  
  (defun ev.format.et (itm)
    (cat
      (default itm.event.eventType "")
      (if (nullp itm.event.trigger) "" (cat ':' itm.event.trigger))
      (if (nullp itm.event.scrn) "" (cat ',' itm.event.scrn))
      (if (nullp itm.event.action) "" (cat ',' itm.event.action))))
  
  
  (defun ev.format.gps (loc)
    (cat '[' loc.1 ' ' loc.0 ' ' loc.2 ' ' loc.3 ']'))
  
  
  (defun ev.format.loc (itm)
    (if (listp itm.event.loc)
        (if (listp (first itm.event.loc))
            (cat (ev.format.gps itm.event.loc.0) '...')
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
      'rows' (map veh-events (fun (itm index)
                               (setq row (dict))
                               (each colmap (fun (f key) (put row key (f itm index))))
                               row))))
  
  
  (defun ev.el (from to)
    (with (data (ev.map-veh-events *__kwargs))
          (table.print &rows data.rows &columns data.columns)))

)

