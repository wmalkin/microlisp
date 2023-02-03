;;
;; Utility functions to manipulate shapes, kml files, etc.
;;


(progn

  ;; Split the coordinates part of a KML file into a list of lists
  (defun kml.kmlpoly (s)
    "Split the coordinates string from a KML file into a list of lists."
    (map (split (trim s) " ") (fun (s1) (split s1 ","))))


  ;; Determine bounding box for a KML polygon.
  ;; Usage: (kmlbounds "-96.64950493718017,46.01227320072478,0 ...")
  ;; Copy & paste the <coordinates> element from a KML polygon.
  (defun kml.kmlbounds (s)
    "Return a bounding box for a KML poly string like '-96.649504,46.012273,0 ...'"
      (setq
        pts (kml.kmlpoly s)
        longs (map pts (fun (p) (tonum (first p))))
        lats (map pts (fun (p) (tonum (first (rest p))))))
      (dict
        'east' (max longs)
        'west' (min longs)
        'south' (min lats)
        'north' (max lats)))



  ;; Return a KML point as a dict, with a kml-generating method
  ;; OOP !!!
  (defun kml.kml-point (lat long options)
    "Construct a KML point, with a .kml output function"
    (dict
      'lat' lat
      'long' long
      'options' (default options (dict))

      'kml' (fun (this)
              (cat
                '<Placemark>'
                (if (has this.options 'name')
                    (cat '<name>' this.options.name '</name>')
                    '')
                (if (has this.options 'description')
                    (cat '<description>' this.options.description '</description>')
                    '')
                (if (has this.options 'style')
                    (cat '<styleUrl>#' this.options.style '</styleUrl>')
                    '')
                '<Point><coordinates>' this.long ',' this.lat '</coordinates></Point>'
                '</Placemark>'))))


  (defun kml.kml-path (locs options)
    "Construct a KML path, with a .kml output function"
    (dict
      'path' locs
      'options' (default options (dict))

      'kml' (fun (this)
              (cat
                '<Placemark>'
                (if (has this.options 'name') (cat '<name>' this.options.name '</name>') '')
                (if (has this.options 'description') (cat '<description>' this.options.description '</description>') '')
                (if (has this.options 'style') (cat '<styleUrl>#' this.options.style '</styleUrl>') '')
                '<LineString>'
                '<tessellate>1</tessellate>'
                '<coordinates>'
                (join (map this.path (fun (pt) (cat pt.0 ',' pt.1 ',0'))) ' ')
                '</coordinates></LineString>'
                '</Placemark>'))))


  (defun kml.kml-point-or-path (event options)
    "Construct either a kml-path or kml-point from an event.loc value"
    (if (listp event.loc.0)
        (kml.kml-path event.loc options)
        (kml.kml-point event.loc.1 event.loc.0 options)))


  ;; Generate a KML document content from a list of objects (use kml-point
  ;; above to create the objects)
  (defun kml.kml-document (objs options)
    "Construct a KML document writer with a set of objects."
    (dict
      'objects' objs
      'kml' (fun (this)
              (cat
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<kml xmlns="http://earth.google.com/kml/2.0">'
                '<Document>'
                (if (has options 'styleurl')
                    (cat '<Style id="' options.styleurl '">'
                         (if (has options 'linestyle')
                             (cat '<LineStyle>'
                                  (if (has options.linestyle 'color') (cat '<color>' options.linestyle.color '</color>') '')
                                  (if (has options.linestyle 'width') (cat '<width>' options.linestyle.width '</width>') '')
                                  '</LineStyle>') '')
                         '</Style>') '')
                (join
                  (map objs (fun (obj) (obj.kml obj)))
                  '')
                '</Document>'
                '</kml>'))))


  ;; Write a kml document to a given path
  (defun kml.write-kml (path kml-obj)
    "Write a kml object to a file at `path`."
    (dos.fs-write path (kml-obj.kml kml-obj)))


  ;; Convert a list of events to a list of kml objects
  (defun kml.kml-from-events (events)
    "Return a KML document object from a list of events."
    (kml.kml-document (map events
                           (fun (evt i)
                            (kml.kml-point-or-path evt.event (dict 'name' i))))))


  ;; Convert the current events buffer and write it to a file
  (defun kml.kml-veh-events (path)
    "Write a KML document at `path` from the list of current veh-events."
    (kml.write-kml path (kml.kml-from-events ev._events)))


  (defun kml.sanitizexmlstr (unsafestr)
    "Take a string and make it KML/XML safe"
         (repl (repl (repl (repl (repl unsafestr
                                       "&" "&amp;")
                                 ">" "&gt;")
                           "<" "&lt;")
                     "\"" "&quot;")
               "\'" "&apos;"))


  (defun _test.test-kml ()
    (_test.eq "test-sanitizexmlstr"
              (kml.sanitizexmlstr "<A brown dog & a 'rat'; \"They're quite a pair.\">")
              "&lt;A brown dog &amp; a &apos;rat&apos;; \&quot;They&apos;re quite a pair.\&quot;&gt;"))

  )
