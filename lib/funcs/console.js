//
// functions that print to the console
//

module.exports = {};

const util = require("../core/util.js"),
      func = require("../core/func.js");

const { Table } = require("console-table-printer");

function $table_print (args) {
    var tdata = args[0];
    new Table(args[0]).printTable();
}

func.def({ name: "table.print", body: $table_print });
