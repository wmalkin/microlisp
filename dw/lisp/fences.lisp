;
; Operations to read fences and other objects from mongo
;

(progn

  
  (defun geofence.read () 
    """
    Read fences from the current env into the global `fences`.
    Also reads all the non-fence objects into `nlrs`.
    """
    (defvar geofence.lr (mongo.find 
                          _env 
                          'objects' 
                          (dict 'type' 'fence'))
            geofence.nlrs (mongo.find
                            _env
                            'objects'
                            (dict 'type' (dict '$nin' (list 'fence' 'deleted')))))
    (count geofence.lr))
  
  
  (defun geofence.ensure ()
    (if (< (count geofence.lr) 500)
        (geofence.read)))

  
  (defun geofence.nearby (loc radius)
    (setq radius (default radius 125))
    (setq objs
      (sort
        (map
          (filter geofence.lr (fun (f) (> radius (distancetoshape loc f.location.coordinates))))
          (fun (g) (dict
                     'ssid' g.serviceSiteId
                     'fenceId' g.id
                     'fenceType' g.fenceType
                     'status' g.status
                     'bearing' g.bearing
                     'site-name' g.loc
                     'centroid' (ev.format.latlong (centroid g))
                     'distance' (distancetoshape loc g.location.coordinates))))
        "distance"))
    (each objs (fun (h) (setq h.distance (tofixed h.distance 1))))
    objs)
  
  
  (defun geofence.prt-nearby (loc radius)
    (table.print
      &rows (geofence.nearby loc radius)))
)