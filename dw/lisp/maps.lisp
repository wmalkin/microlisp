;
; Suport for the US and World maps in the office
;

(progn

 	(setq
    	maps.q.start-time "60m"
     	maps.q.end-time "59m"
      	maps.q.latest-time null)
  	
   	(defun maps.time-clause ()
      (if maps.q.latest-time
          (wh.$t maps.q.latest-time maps.q.end-time)
          (wh.$t maps.q.start-time maps.q.end-time)))
    
	(defun maps.query ()
		(ev.query '60m,10s' (wh.$et 'TEVT' 'UI') (wh.$ui null 'show')))


	(defun maps.send-point (loc hue)
		(udp.send (cat "1 " hue " " loc.1 " " loc.0 " map:ping-lat-long") 8888 "10.10.12.10")
  		(udp.send (cat "1 " hue " " loc.1 " " loc.0 " map:ping-lat-long") 8888 "192.168.200.12"))

)