;;
;; Optional compatibility functions for SETS and jsdrive.
;; To activate these functions, include "dialect":"drivewye"
;; in the options JSON.
;;

(progn
  (if (eq _options_.dialect "drivewyze")
      (progn
        (setq block progn)
        (setq global defvar)
        (setq with let)
        (setq let setq)
        (setq set setq)
        (setq add +)
        (setq sub -)
        (setq mul *)
        (setq div /)
        (setq eq ==)
        (setq ne !=)
        (setq gt <)
        (setq lt >)
        (setq ge <=)
        (setq le >=)
        
        (setq isstr strp)
        (setq isnum nump)
        (setq isbool boolp)
        (setq isdate datep)
        (setq islist listp)
        (setq isdict dictp)
        
        (setq foreach each)
        (setq sdict put)
        (setq slist put)
        (setq gdict get)
        (setq glist get)
        (setq butlast prune)
        
        (setq pushhead push)
        (setq pophead pop)
        (defmacro pushtail (m n) `(setq ,m (append ,m ,n)))
        (defmacro poptail (m) `(first (splice ,m (- (count m) 1) 1)))
        
        (defmacro endsic (a b) `(ends (upper ,a) (upper ,b)))
        (defmacro beginsic (a b) `(begins (upper ,a) (upper ,b)))
        (defmacro contsic (a b) `(conts (upper ,a) (upper ,b)))
        
        ))
  
)

