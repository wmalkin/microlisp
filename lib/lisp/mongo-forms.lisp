;;
;; mongo query forms
;;

(progn

  (defun mongo.ne (v)
    """
    mongo.ne returns the right-hand-side of a mongo.find not-equal-to.

    (dict 'event.count' ($ne 0)) => {'event.count': {'$ne': 0}}
    """
    (dict '$ne' v))


  (defun mongo.gt (v)
    """
    mongo.gt returns the right-hand-side of a mongo.find greater than.

    (dict 'event.count' ($gt 5)) => {'event.count': {'$gt': 5}}
    """
    (dict '$gt' v))


  (defun mongo.lt (v)
    """
    mongo.lt returns the right-hand-side of a mongo.find less than.

    (dict 'event.count' ($lt 5)) => {'event.count': {'$lt': 5}}
    """
    (dict '$lt' v))


  (defun mongo.gte (v)
    """
    mongo.gte returns the right-hand-side of a mongo.find greater than.

    (dict 'event.count' ($gte 5)) => {'event.count': {'$gte': 5}}
    """
    (dict '$gte' v))


  (defun mongo.lte (v)
    """
    mongo.lte returns the right-hand-side of a mongo.find less than.

    (dict 'event.count' ($lte 5)) => {'event.count': {'$lte': 5}}
    """
    (dict '$lte' v))


  (defun mongo.between (v1 v2)
    """
    mongo.between returns the right-hand-side of a mongo.find between.
    It also orders the inputs.

    (dict 'event.count' ($between 5 10)) => {'event.count': {'$gt':5, '$lt':10}}
    """
    (dict '$gt' (min v1 v2) '$lt' (max v1 v2)))

  (defun mongo.in ()
    """
    mongo.in returns a mongo.find right-hand-side for a value in a list.

    (mongo.v (mongo.in 211211 231231 453432)) => {'device.vehicleId':{$in:[211211,231231,453432]}}
    """
    (dict "$in" (explode __args)))


  (defun mongo.nin ()
    """
    mongo.nin returns a mongo.find right-hand-side for a value in a list.

    (mongo.v (mongo.nin 211211 231231 453432)) => {'device.vehicleId':{$nin:[211211,231231,453432]}}
    """
    (dict "$nin" (explode __args)))


  (defun mongo.or ()
    """
    mongo.or assembles a list of mongo.find clauses with an $or clause.

    (mongo.or (mongo.et 'OSR') (mongo.et 'OSU')) => {$or:[{'event.eventType':'OSR'},{'event.eventType':'OSU'}]}
    """
    (dict "$or" __args))


  (defun mongo.is-or-in (ids)
    """
    (mongo.is-or-in) accepts either a single id or a list of ids, and returns
    the appropriate mongo.find form.
    
    (is-or-in 123) => 123
    (is-or-in (list 1 2 3)) => { $in: [1,2,3] }
    (is-or-in (list (list 1 2) (list 3 4) 5)) => { $in: [1,2,3,4,5] }
    """
    (let rs (explode ids))
    (if (== 1 (count rs)) rs.0 (mongo.in rs)))
  

  (defun mongo.exists ()
    """
    mongo.exists returns a mongo.find clause that checks for the existence
    of the fields (paths) named in its arguments.

    (mongo.exists 'device.loc') => {'device.loc':{$exists:true}}
    """
    (let rs (dict))
    (each __args (fun (field) (putkey rs field (dict '$exists' true))))
    rs)
  

  (defun mongo.split (str char)
    """split string by delimeter"""
    (dict "$split" (list str char)))

  (defun mongo.arrayElemAt (array idx)
    """ retrieves the element at indix idx in array """
    (dict "$arrayElemAt" (list array idx)))

  (defun mongo.lookup (&from &localField &foreignField &as)
    (dict "$lookup" (dict "from" from
                          "localField" localField
                          "foreignField" foreignField
                          "as" as)))
)

