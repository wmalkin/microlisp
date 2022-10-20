;;
;; mongo query forms
;;

(progn

  (defun $ne (v)
    """
    $ne returns the right-hand-side of a mongo.find not-equal-to.

    (dict 'event.count' ($ne 0)) => {'event.count': {'$ne': 0}}
    """
    (dict '$ne' v))


  (defun $gt (v)
    """
    $gt returns the right-hand-side of a mongo.find greater than.

    (dict 'event.count' ($gt 5)) => {'event.count': {'$gt': 5}}
    """
    (dict '$gt' v))


  (defun $lt (v)
    """
    $lt returns the right-hand-side of a mongo.find less than.

    (dict 'event.count' ($lt 5)) => {'event.count': {'$lt': 5}}
    """
    (dict '$lt' v))


  (defun $gte (v)
    """
    $gte returns the right-hand-side of a mongo.find greater than.

    (dict 'event.count' ($gte 5)) => {'event.count': {'$gte': 5}}
    """
    (dict '$gte' v))


  (defun $lte (v)
    """
    $lte returns the right-hand-side of a mongo.find less than.

    (dict 'event.count' ($lte 5)) => {'event.count': {'$lte': 5}}
    """
    (dict '$lte' v))


  (defun $between (v1 v2)
    """
    $between returns the right-hand-side of a mongo.find between.
    It also orders the inputs.

    (dict 'event.count' ($between 5 10)) => {'event.count': {'$gt':5, '$lt':10}}
    """
    (dict '$gt' (min v1 v2) '$lt' (max v1 v2)))

  (defun $in ()
    """
    $in returns a mongo.find right-hand-side for a value in a list.

    ($v ($in 211211 231231 453432)) => {'device.vehicleId':{$in:[211211,231231,453432]}}
    """
    (dict "$in" (explode __args)))


  (defun $nin ()
    """
    $nin returns a mongo.find right-hand-side for a value in a list.

    ($v ($nin 211211 231231 453432)) => {'device.vehicleId':{$nin:[211211,231231,453432]}}
    """
    (dict "$nin" (explode __args)))


  (defun $or ()
    """
    $or assembles a list of mongo.find clauses with an $or clause.

    ($or ($et 'OSR') ($et 'OSU')) => {$or:[{'event.eventType':'OSR'},{'event.eventType':'OSU'}]}
    """
    (dict "$or" __args))


  (defun is-or-in (ids)
    """
    (is-or-in) accepts either a single id or a list of ids, and returns
    the appropriate mongo.find form.
    
    (is-or-in 123) => 123
    (is-or-in (list 1 2 3)) => { $in: [1,2,3] }
    (is-or-in (list (list 1 2) (list 3 4) 5)) => { $in: [1,2,3,4,5] }
    """
    (let rs (explode ids))
    (if (== 1 (count rs)) rs.0 ($in rs)))
  

  (defun $exists ()
    """
    $exists returns a mongo.find clause that checks for the existence
    of the fields (paths) named in its arguments.

    ($exists 'device.loc') => {'device.loc':{$exists:true}}
    """
    (let rs (dict))
    (each __args (fun (field) (sdict rs field (dict '$exists' true))))
    rs)
  

  (defun $split (str char)
    """split string by delimeter"""
    (dict "$split" (list str char)))

  (defun $arrayElemAt (array idx)
    """ retrieves the element at indix idx in array """
    (dict "$arrayElemAt" (list array idx)))

  (defun $lookup (&from &localField &foreignField &as)
    (dict "$lookup" (dict "from" from
                          "localField" localField
                          "foreignField" foreignField
                          "as" as)))
)

