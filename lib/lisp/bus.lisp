;
; event observer and bus
;

(progn
	
	(defvar $observers (list))

	(defun on-event (filter observer &name)
		(push $observers (dict
			'name' name
			'filter' filter
			'observer' observer)))


	(defun emit ()
		(setq eargs __args ekwargs __kwargs)
		(each $observers (fun (obs)
			(if (apply obs.filter *eargs *kwargs)
				(apply obs.observer *eargs *kwargs)))))


	(defun drop-event (name)
		(setq $observers (filter $observers (fun (obs) (!= name obs.name)))))


)

