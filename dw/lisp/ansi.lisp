;;
;; Namespace: ANSI
;; Key codes for manipulating terminal windows
;;

(progn
  
  (let ansi.*docs*
    """
    ANSI escape codes for terminal output and manipulation
    """)
  
  
  (defun ansi.fg (ci)
    """
    Returns escape code to set the foreground color to `ci`.
    """
    (cat (fromcharcode 27) "[38;5;" ci "m"))
  
  
  (defun ansi.bg (ci)
    """
    Returns escape code to set the background color to `ci`.
    """
    (cat (fromcharcode 27) "[48;5;" ci "m"))
  
  
  (defun ansi.bold ()
    """
    Returns escape code to turn on bold text.
    """
    (cat (fromcharcode 27) "[1m"))
  
  
  (defun ansi.ul ()
    """
    Returns escape code to turn on italic text.
    """
    (cat (fromcharcode 27) "[4m"))
  
  
  (defun ansi.rev ()
    """
    Returns escape code to turn on text inversion.
    """
    (cat (fromcharcode 27) "[7m"))
  
  
  (defun ansi.cr ()
    """
    Returns escape code to reset the color.
    Should be included at the end of any other escape sequence.
    """
    (cat (fromcharcode 27) "[0m"))
  
  
  (defun ansi.ctxt (txt color)
    """
    Wraps `txt` in escape codes to color just that text with `color`.
    """
    (cat (ansi.fg color) txt (ansi.cr)))
  
  
  (defun ansi.green (txt)
    """
    Wraps `txt` with escape codes for green text.
    """
    (ansi.ctxt txt 46))
  
  
  (defun ansi.yellow (txt)
    """
    Wraps `txt` with escape codes for yellow text.
    """
    (ansi.ctxt txt 226))
  
  
  (defun ansi.red (txt)
    """
    Wraps `txt` with escape codes for red text.
    """
    (ansi.ctxt txt 196))
  
  
  (defun ansi.purple (txt)
    """
    Wraps `txt` with escape codes for purple text.
    """
    (ansi.ctxt txt 54))
  
  
  (defun ansi.blue (txt)
    """
    Wraps `txt` with escape codes for blue text.
    """
    (ansi.ctxt txt 4))
  
  
  (defun ansi.orange (txt)
    """
    Wraps `txt` with escape codes for orange text.
    """
    (ansi.ctxt txt 202))
  
  
  (defun ansi.clr-screen ()
    """
    Returns ANSI escape code to clear the screen.
    """
    (cat (fromcharcode 27) "[2J"))
  
  
  (defun ansi.erase-eol ()
    """
    Returns ANSI escape code to erase to EOL.
    """
    (cat (fromcharcode 27) "[K"))
  
  
  (defun ansi.move (x y)
    """
    Returns ANSI escape code to move cursor to (x,y).
    """
    (cat (fromcharcode 27) "[" y ";" x "H"))
  
  
  (defun ansi.move-up (n)
    """
    Returns ANSI ecsape code to move cursor up `n` lines.
    """
    (cat (fromcharcode 27) "[" n "A"))
  
  
  (defun ansi.move-down (n)
    """
    Returns ANSI escape code to move cursor down `n` lines.
    """
    (cat (fromcharcode 27) "[" n "B"))
  
  
  (defun ansi.move-fwd (n)
    """
    Returns ANSI escape code to move cursor forward `n` characters.
    """
    (cat (fromcharcode 27) "[" n "C"))
  
  
  (defun ansi.move-back (n)
    """
    Returns ANSI escape code to move cursor back `n` characters.
    """
    (cat (fromcharcode 27) "[" n "D"))
  
  
  (defun ansi.print-color-codes ()
    """
    Print a table of ANSI color codes, in their corresponding colors.
    These codes can be used with (ansi.ctxt 'string' code) to
    produce colored text.
    """
    (for (i 0 16)
         (let line "")
         (for (j 0 16)
              (let ci (+ (* i 16) j))
              (let line
                (cat
                  line
                  (ansi.fg ci)
                  (substr (cat ci "    ") 0 4)
                  (ansi.cr))))
         (prt line)))
  
  
  )