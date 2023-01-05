
//
// wrapper functions for Postgres queries
//

module.exports = {};

const func = require("../../lib/core/func.js"),
      util = require("../../lib/core/util.js");


const { Pool } = require('pg'),
      format = require('pg-format');


let pool;


async function Connect(con) {
    if (pool)
        return pool

    // connect and cache dbo
    pool = new Pool(con.conn);
    return pool
}


async function $postgres_run(ops) {
    if (ops.length < 2) {
        console.log("postgres.run: insufficient parameters")
        return Promise.reject("postgres.run: insufficient parameters");
    }

    let db = ops[0];
    let query = {}
    if (util.isdict(ops[1])) {
        try {
            query['text'] = format.withArray(ops[1].stmt, ops[1].val)
        } catch(e) {
            console.log(e)
        }
    } else {
        query['text'] = ops[1]
        if (ops.length > 2) {
            query['values'] = ops[2]
        }
    }

    let client = await Connect(db)
    let rs = await client.query(query).catch(err => {
        console.log(err)
        return Promise.reject(err);
    })

    return rs.rows
}


func.def({ name: "postgres.run", body: $postgres_run });
