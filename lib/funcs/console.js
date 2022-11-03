//
// functions that print to the console
//

module.exports = {};

const util = require("../core/util.js"),
      func = require("../core/func.js"),
      paths = require("../core/paths.js");

const { Table } = require("console-table-printer");

function $table_print (args) {
    var tdata = args[0];
    if (tdata.sort) {
        var sortpaths = tdata.sort;
        tdata.sort = (a,b) => {
            var i = 0;
            while (i < sortpaths.length) {
                var va = paths.__resolveInContainer(sortpaths[i], a).value,
                    vb = paths.__resolveInContainer(sortpaths[i], b).value;
                if (va < vb)
                    return -1;
                else if (va > vb)
                    return 1;
                i++;
            }
            return 0;
        }
    }
    new Table(args[0]).printTable();
}

func.def({ name: "table.print", body: $table_print });
