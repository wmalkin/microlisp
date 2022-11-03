//
// functions that print to the console
//

module.exports = {};

const util = require("../core/util.js"),
      func = require("../core/func.js");

const { Table } = require("console-table-printer");

function $table_print (args) {
    var tdata = args[0];
    if (tdata.sort) {
        var sortfunc = tdata.sort;
        tdata.sort = (row1, row2) => {
            return ea.apply_sync(sortfunc, [row1, row2]);
        }
    }
    new Table(args[0]).printTable();
}

func.def({ name: "table.print", body: $table_print });
