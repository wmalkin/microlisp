# microlisp
tiny Lisp implementation native to JavaScript


# code organization
This project is organized into distinct parts:

* Language core, in JavaScript modules under the lib/core directory
* Built-in Lisp functions that are implemented in JavaScript, either by necessity or for speed, in JavaScript modules under the lib/funcs directory
* Built-in Lisp functions that are implemented in Lisp, in .lisp source files under the lib/lisp directory
* A wrapper module, lisp.js, that organizes all of the above and republishes only the interfaces necessary to interact with the interpreter

Basic usage involves building a node.js application like "ml.js" that requires the lisp.js module, loads in any other functions (js modules or lisp files), and then starts calling one of the eval entry points in the lisp object.


# modules and circular references
Many of the core modules reference one another circularly. This is allowed in node.js, but can be problematic when node sees a circular reference and returns an incomplete module interface. The approach taken here is to declare a "module.exports" object at the very top of each module, before any other modules are imported, and then to fill in the fields of that object later. This ensures that each module returns a valid interface object, even if it is empty, and that other modules can retain references to those objects for later use.

# Drivewyze content
I have also started adding some Drivewyze-specific content, or at least optional modules that have value to Drivewyze. These are contained in the dw/funcs and dw/lisp directories.

The ml.lisp example shows how to import new JavaScript modules that declare Lisp wrappers for JavaScript functionality. It also shows how to import a new directory of Lisp content.

