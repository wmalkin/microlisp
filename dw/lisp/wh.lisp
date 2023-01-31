;;
;; Data warehouse query forms
;;

(progn

  (setq wh.otr-events-table "otr.events")
  (setq wh.otr-events-columns "id, event_id, connection_id, server_timestamp at time zone 'UTC' as server_time, device_timestamp at time zone 'UTC' as device_time, device_id, partner, direction, event, context, gps_first_timestamp at time zone 'UTC' as gps_first_time, gps_last_timestamp at time zone 'UTC' as gps_last_time, event_size")

  (defun wh.otr-query (&from &limit)
    (pg.fold-statement 
      (pg.$select wh.otr-events-columns)
      ; (pg.$from (default from "events.otr_events"))
      (pg.$from (default from wh.otr-events-table))
      (pg.$where
        (pg.$and __args))
      (pg.$order-by "server_timestamp")
      (pg.$limit (default limit 1000))))
  
  
  (defun wh.partition (yyyy mm)
    (cat "part.otr_events_" yyyy "_" (lead0 mm)))
  
  
  ; (defun wh.extract-event (vin)
  ;   (if (listp vin)
  ;       (map vin (fun (v) (wh.extract-event v)))
  ;       (if (and (dictp vin) (has vin 'event'))
  ;           vin.event
  ;           vin)))
  
  (defun wh.extract-event (vin) vin)
  
  (defun wh.otr ()
    (setq query (wh.otr-query *__args *__kwargs))
    (prt query)
    (pg.post-process-result (wh.extract-event (pg.run "datalake" query))))
  

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
  
  
  (defun wh.$d (did)
    """
    Returns a Postgres where clause for context.deviceId.
    """
    (wh.is-or-in "event.context.deviceId" did))
  
  
  (defun wh.$uid (uid)
    """
    Returns a Postgres where clause for context.userId.
    """
    (wh.is-or-in "event.context.userId" uid))
  
  
  (defun wh.$et (eventType trigger)
    """
    Returns a Postgres where clause for event.eventType and event.trigger.
    """
    (if (not (nullp eventType))
        (if (not (nullp trigger))
            (pg.$and (wh.is-or-in "event.event.eventType" eventType) (wh.is-or-in "event.event.trigger" trigger))
            (wh.is-or-in "event.event.eventType" eventType))
        (wh.is-or-in "event.event.trigger" trigger)))
  
  
  (defun wh.$evgid (id)
    """
    Returns a Postgres where clause for event.evgid.
    """
    (wh.is-or-in "event.event.evgid" id))
  
  
  (defun wh.$ui (scrn action)
    """
    Returns a Postgres where clause for event.scrn and event.action.
    """
    (if (not (nullp scrn))
        (if (not (nullp action))
            (pg.$and (wh.is-or-in "event.event.scrn" scrn) (wh.is-or-in "event.event.action" action))
            (wh.is-or-in "event.event.scrn" scrn))
        (wh.is-or-in "event.event.action" action)))
  
  
  (defun wh.$cmd (id)
    """
    Returns a Postgres where clause for event.command.
    """
    (wh.is-or-in "event.event.command" id))
  
  
  (defun wh.$fence (id)
    (wh.is-or-in "event.fence.id" id))
  
  
  (defun wh.$site (ssid-or-name)
    """
    Return a Postgres where clause for a service site.
    Accepts a number or a partial service site name.
    If a name is given, find all service sites matching that name
    and return an $in form. This function uses geofences from
    the current mongo environment to perform the name lookup.
    """
    (fences.ensure)
    (if (nullp fences) (read-fences))
    (if (isnum ssid-or-name)
        (wh.is-or-in "event.fence.serviceSiteId" ssid-or-name)
        (block
          (let words (clist ssid-or-name ' '))
          (wh.is-or-in "event.fence.serviceSiteId"
                       (distinct
                         (map
                           (filter fences ((f) (cont-words-ic f.loc words)))
                           ((f) f.serviceSiteId)))))))
  
  
)