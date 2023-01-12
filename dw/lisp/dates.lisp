(progn

  (setq dates.*docs*
    """
    Functions to manipulate and format dates.
    """)


  (setq dates.multipliers
    (dict
      'd' 86400000
      'h' 3600000
      'm' 60000
      's' 1000
      'ms' 1))

  (setq 1h '1h' 2h '2h' 3h '3h' 4h '4h' 5h '5h' 6h '6h' 8h '8h' 12h '12h'
    1d '1d' 2d '2d' 3d '3d' 4d '4d' 5d '5d' 7d '7d' 10d '10d' 14d '14d' 21d '21d' 28d '28d' 30d '30d' 60d '60d' 90d '90d'
    1w '7d' 2w '14d' 3w '21d' 4w '28d')


  (defun dates.tz-offset ()
    (setq dt (now))
    (-
      (mod
        (+
          36
          (-
            (get (local-date dt) 'hour')
            (get (gmt-date dt) 'hour')))
      24)
    12))
  
  
  (defun dates.time-range-in-ms (time-range)
    """
    Convert `time-range` to milliseconds.

    `time-range` must be in the format of '1h', where the numeric portion
    is an integer quantity of time, and the string portion is a time unit.

    Allowed units are:
    - 'd': day(s)
    - 'h': hour(s)
    - 'm': minute(s)
    - 's': second(s)
    - 'ms': millisecond(s)

    The time quantity can be a negative value, and this function will return
    a negative millisecond value in such calls.

    If `time-range` is not provided, the default result will be 1 day (1d).
    """
    (if (nullp time-range)
        (* dates.multipliers.d 1)
        (if (strp time-range)
            (let (time-value (substr time-range 0 (- (count time-range) 1))
                   time-unit (substr time-range -1))
                  (if (not (nullp (get dates.multipliers time-unit)))
                      (* (get dates.multipliers time-unit) (tonum time-value))
                      (prt "Unrecognized time unit in time-range.")))
            (prt "time-range must be a string containing a time quantity and time unit."))))


  (defun dates.add (base-date time-range)
    """
    Calculates a new date from `base-date`, offset in the past or future by `time-range`.

    `time-range` must be in the format of 1h, where the numeric portion
    is an integer quantity of time, and the string portion is a time unit. See
    `time-range-in-ms` for allowed values.
    """
      (if (datep base-date) (setq base-date (tonum base-date)))
      (todate (+ base-date (dates.time-range-in-ms time-range))))


  (defun dates.date-diff-ms (first-date second-date)
    """
    Gets the difference, in milliseconds, between `first-date` and `second-date`.

    The two parameters can be a date or a millisecond value.

    Returns a positive value if `second-date` is before `first-date`, and a negative
    value otherwise.
    """
    (progn
      (if (datep first-date) (setq first-date (tonum first-date)))
      (if (datep second-date) (setq second-date (tonum second-date)))
      (- first-date second-date)))


  (defun dates.now-minus-ms (ms)
    """
    Calculates a date `ms` milliseconds in the past from the current date.
    """
    (todate (- (nowms) ms)))


  (defun dates.now-minus-units (time-value time-unit)
    """
    Calculates a date in the past - as a Date object - from the current date, subtracting the
    amount of time specified by `time-value` and `time-unit`.
    """
    (todate (- (nowms) (* (get dates.multipliers time-unit) (tonum time-value)))))


  (defun dates.base-plus-units (base-time time-value time-unit)
    """
    Calculates a date in the future - in milliseconds - from `base-time`, adding the
    amount of time specified by `time-value` and `time-unit`.
    """
    (+ base-time (* (get dates.multipliers time-unit) (tonum time-value))))
  
  
  (defun dates.fmt-short-date (d)
    """
    Format a date (dict) as a short date, ie. `2021-11-01 19:07:00`.
    """
    (if (nullp d)
        null
        (cat d.year "-" (lead0 d.month) "-" (lead0 d.day) " " (lead0 d.hour) ":" (lead0 d.min) ":" (lead0 d.sec))))


  (defun dates.fmt-internet-date (d)
    """
    Format a date (dict) as an ISO date string, ie. `2021-11-01T19:07:00.902Z`.
    """
    (if (nullp d)
        null
        (cat d.year "-" (lead0 d.month) "-" (lead0 d.day) "T"  (lead0 d.hour) ":" (lead0 d.min) ":" (lead0 d.sec) "." d.ms "Z")))


  (defun dates.internet-date (dt)
    """
    Format a date to ISO standard.
    Input can be a date or a millisecond timestamp.
    """
    (if (and (not (nullp dt)) (!= dt 0))
        (progn
          (if (nump dt) (setq dt (todate dt)))
          (dates.fmt-internet-date (gmt-date dt)))))


  (defun dates.short-date (dt)
    """
    Format a date as short local date string.
    Input can be a date or a millisecond timestamp.
    """
    (if (and (not (nullp dt)) (!= dt 0))
        (progn
          (if (nump dt) (setq dt (todate dt)))
          (dates.fmt-short-date (local-date dt)))))


  (defun dates.short-date-gmt (dt)
    """
    Format a date as short GMT date string.
    Input can be a date or a millisecond timestamp.
    """
    (if (and (not (nullp dt)) (!= dt 0))
        (progn
          (if (nump dt) (setq dt (todate dt)))
          (dates.fmt-short-date (gmtdate dt)))))


  (defun dates.fmt-short-date-ms (d)
    """
    Format a date as (fmt-short-date) but with the addition of a millisecond field.
    Input must be a dict.
    """
    (cat d.year "-" (lead0 d.month) "-" (lead0 d.day) " " (lead0 d.hour) ":" (lead0 d.min) ":" (fixed-lead0 (+ d.sec (/ d.ms 1000)) 3)))


  (defun dates.short-date-ms (dt)
    """
    Format a date as short local date string, with milliseconds.
    Input can be a date or a millisecond timestamp.
    """
    (if (and (not (nullp dt)) (!= dt 0))
        (progn
          (if (nump dt) (setq dt (todate dt)))
          (dates.fmt-short-date-ms (local-date dt)))))


  (defun dates.short-date-gmt-ms (dt)
    """
    Format a date as short GMT date string, with milliseconds.
    Input can be a date or a millisecond timestamp.
    """
    (if (and (not (nullp dt)) (!= dt 0))
        (progn
          (if (nump dt) (setq dt (todate dt)))
          (dates.fmt-short-date-ms (gmt-date dt)))))


  (defun dates.fmt-hhmmss (d)
    """
    Format the time component of the input as HH:MM:SS.
    Input must be a dict.
    """
    (cat (lead0 d.hour) ':'
         (lead0 d.min) ':'
         (lead0 d.sec)))


  (defun dates.hhmmss (dt)
    """
    Format a time to local time string.
    Input can be a date or a millisecond timestamp.
    """
    (progn
      (if (nump dt) (setq dt (todate dt)))
      (dates.fmt-hhmmss (local-date dt))))


  (defun dates.hhmmss-gmt (dt)
    """
    Format a time to GMT time string.
    Input can be a date or a millisecond timestamp.
    """
    (progn
      (if (nump dt) (setq dt (todate dt)))
      (dates.fmt-hhmmss (gmt-date dt))))


  (defun dates.ms-as-decimal-s (s)
    """
    Format milliseconds as a number of decimal seconds,
    with a `s` suffix. Values greater than an hour are
    returned as the string `>1h`.
    """
    (if (> s 3600000)
        ">1h"
        (cat (tofixed (/ s 1000) 1) "s")))
  
  
  (defun dates.fmt-timespan (dt)
    (if (< dt 1000)
        (cat dt 'ms')
        (if (< dt 90000)
            (cat (tofixed (/ dt 1000) 1) 's')
            (if (< dt 3600000)
                (cat (tofixed (/ dt 60000) 1) 'm')
                (cat (tofixed (/ dt 3600000) 2) 'h')))))

  
)

