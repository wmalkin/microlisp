//
// functions that print to the console
//

const util = require("../core/util.js"),
      func = require("../core/func.js"),
      paths = require("../core/paths.js"),
      scopes = require("../core/scopes.js");

const { Table } = require("console-table-printer");

async function $table_print (args, scope) {
    var params = await scopes.destructure(['data', '&rows', '&columns'], args, scope);
    var attrs = {};
    if (util.isdict(params.data))
        attrs = params.data;
    var t = new Table(attrs);
    if (util.islist(params.columns))
        t.addColumns(params.columns);
    if (util.islist(params.rows))
        t.addRows(params.rows);
    t.printTable();
}

func.def({ name: "table.print", body: $table_print });
