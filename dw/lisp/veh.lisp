;;
;; utilities for vehicle queries
;;

(progn

  (defun veh.last-osr (vids)
    (map vids
      (fun (vid) 
        (last 
          (ev.query ($v vid) ($t 1d) ($et "OSR"))))))

)