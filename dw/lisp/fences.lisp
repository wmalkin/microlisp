;
; Operations to read fences and other objects from mongo
;

(progn

  
  (defun fences.read () 
    """
    Read fences from the current env into the global `fences`.
    Also reads all the non-fence objects into `nlrs`.
    """
    (defvar fences (mongo.find 
                     _env 
                     'objects' 
                     (dict 'type' 'fence'))
            nlrs (mongo.find
                   _env
                   'objects'
                   (dict 'type' (dict '$nin' (list 'fence' 'deleted')))))
    (count fences))

)