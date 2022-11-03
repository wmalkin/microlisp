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


)

