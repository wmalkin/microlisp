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
  
  
  (defun fences.ensure ()
    (if (< (count fences) 500)
        (fences.read)))

  
  (defun fences.nearby (loc radius)
    (setq radius (default radius 125))
      (map
        (sort
          (map
            (filter geofence.lr (fun (f) ())
            (fun (f) (gt radius (distancetoshape loc f.location.coordinates)))
            (fun (g) (dict
                       'ssid' g.serviceSiteId
                       'fenceId' g.id
                       'fenceType' g.fenceType
                       'status' g.status
                       'bearing' g.bearing
                       'site-name' g.loc
                       'distance' (distancetoshape loc g.location.coordinates))))
          "distance")
        (fun (h) 
         (block
           (let h.distance (tofixed h.distance 1)) 
           h))))))
  
  
  (defun fences.prt-nearby (loc radius)
    (table.print
      &rows (fences.nearby loc radius)))
)