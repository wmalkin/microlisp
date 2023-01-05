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

)

