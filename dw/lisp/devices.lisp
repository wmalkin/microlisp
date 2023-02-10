;;
;; Utility functions to manipulate shapes, kml files, etc.
;;


(progn

  ;; Determine bounding box for a KML polygon.
  ;; Usage: (kmlbounds "-96.64950493718017,46.01227320072478,0 ...")
  ;; Copy & paste the <coordinates> element from a KML polygon.
  (defun dev.count-fences (vid)
    (count (keys (gdict (mongo.findone _env 'devices' (dict 'info.vehicleId' vid) &limit 1) 'lr'))))


)

