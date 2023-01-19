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
    // if (tdata.sort) {
    //     var sortpaths = tdata.sort;
    //     tdata.sort = (a,b) => {
    //         var i = 0;
    //         while (i < sortpaths.length) {
    //             var va = paths.__resolveInContainer(sortpaths[i], a).value,
    //                 vb = paths.__resolveInContainer(sortpaths[i], b).value;
    //             if (va < vb)
    //                 return -1;
    //             else if (va > vb)
    //                 return 1;
    //             i++;
    //         }
    //         return 0;
    //     }
    // }
}

func.def({ name: "table.print", body: $table_print });
