;
; event observer and bus
;

(progn
	
	(defvar 
		$observers (list)
		$event-queue (list))

	(defun on-event (filter observer &name)
		(push $observers (dict
			'name' name
			'filter' filter
			'observer' observer)))


	(defun process-event-queue ()
		(setq event (pop $event-queue))
		(if event
			(each $observers (fun (obs)
				(if (apply obs.filter *event.args *event.kwargs)
					(apply obs.observer *event.args *event.kwargs)))))
		(if (count $event-queue)
			(timer.timeout 0 (process-event-queue))))

	
	(defun emit-event ()
		(pushtail $event-queue (dict 'args' __args 'kwargs' __kwargs))
		(timer.timeout 0 (process-event-queue)))



	(defun drop-observer (name)
		(setq $observers (filter $observers (fun (obs) (!= name obs.name)))))


)

