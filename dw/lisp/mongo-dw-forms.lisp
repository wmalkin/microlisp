;;
;; mongo drivewyze forms
;;

(progn
  
  (defun parse-start-time (tr)
    (if (nullp tr)
        (now-minus-ms multipliers.d)
        (with (
               'time-value' (substr tr 0 (- (count tr) 1))
               'time-unit' (substr tr -1))
              (if  (not (isnull (gdict multipliers time-unit)))
                  (now-minus-units time-value time-unit)
                  (date tr)))))


  (defun parse-end-time (start-time dur)
    (with (
           'time-value' (substr dur 0 (- (count dur) 1))
           'time-unit' (substr dur -1))
          (if (ne null (gdict multipliers time-unit))
              (base-plus-units (parse-start-time start-time) time-value time-unit)
              (date dur))))


)

