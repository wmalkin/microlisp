//
// wrapper functions for mongodb access
//


module.exports = {};


const MongoClient = require('mongodb').MongoClient,
      ObjectId = require('mongodb').ObjectId;

const func = require("../core/func.js"),
      util = require("../core/util.js"),
      scopes = require("../core/scopes.js");


async function OpenDatabase(config) {
    if (config.dbo) {
        return config.dbo
    }

    if (config) {
        return MongoClient.connect(config.connstr,{ useNewUrlParser: true, useUnifiedTopology: true })
            .then(client => {
                var dbo = client.db(config.db);
                if (!dbo) {
                    return Promise.reject("Database does not exist.");
                }
                config.dbo = dbo;
                return dbo
            });
    } else {
        return Promise.reject('Connection lookup failed: ' + config.connstr);
    }
}


async function mongo_prep(args, bindings, scope) {
    return new Promise(async (resolve, reject) => {
        var params = scopes.$destructure([args, bindings], scope);
        // var s = scopes.create(scope);
        // await s.bind(bindings, args);
        // var params = {};
        // for (var i = 0; i < bindings.length; i++)
        //     params[bindings[i]] = s.get(bindings[i]);

        if (params.db) {
            if (params.coll == 'events' && params.query.ts == null)
                reject("All mongo event queries against 'events' must have a 'ts' limit");
            else {
                OpenDatabase(params.db).then(dbo => {
                    params.dbo = dbo;
                    params.collection = null;
                    if (params.coll) {
                        params.collection = dbo.collection(params.coll);
                        if (!params.collection)
                            reject("no collection");
                    }
                    resolve(params);
                })
            }
        } else {
            reject("mongo: insufficient parameters");
        }
    });
}



async function $mongo_count(args, scope) {
    return mongo_prep(args, ['db','coll','query','options'], scope).then(params => {
        return params.collection.count(params.query, params.options)
    });
}


async function $mongo_find(args, scope) {
    return mongo_prep(args, ['db','coll','query','options'], scope).then(params => {
        return params.collection.find(params.query, params.options).toArray()
    });
}


async function $mongo_findone(args, scope) {
    return mongo_prep(args, ['db','coll','query','options'], scope).then(params => {
        return params.collection.findOne(params.query, params.options)
    });
}


async function $mongo_insertone(args, scope) {
    return mongo_prep(args, ['db','coll','record','options'], scope).then(params => {
        return params.collection.insertOne(params.record, params.options)
    });
}


async function $mongo_insertmany(args, scope) {
    return mongo_prep(args, ['db','coll','records','options'], scope).then(params => {
        return params.collection.insertMany(params.records, params.options).toArray()
    });
}


async function $mongo_updateone(args, scope) {
    return mongo_prep(args, ['db','coll','filter','update','options'], scope).then(params => {
        return params.collection.updateOne(params.filter, params.update, params.options).toArray()
    });
}


async function $mongo_updatemany(args, scope) {
    return mongo_prep(args, ['db','coll','filter','update','options'], scope).then(params => {
        return params.collection.updateMany(params.filter, params.update, params.options).toArray()
    });
}


async function $mongo_deleteone(args, scope) {
    return mongo_prep(args, ['db','coll','filter','delete','options'], scope).then(params => {
        return params.collection.deleteOne(params.filter, params.update, params.options).toArray()
    });
}


async function $mongo_deletemany(args, scope) {
    return mongo_prep(args, ['db','coll','filter','delete','options'], scope).then(params => {
        return params.collection.deleteMany(params.filter, params.delete, params.options).toArray()
    });
}


async function $mongo_listdbs(args, scope) {
    return mongo_prep(args, ['db'], scope).then(params => {
        return params.dbo.admin().listDatabases()
    });
}



func.def({ name: "mongo.count", body: $mongo_count });
func.def({ name: "mongo.find", body: $mongo_find });
func.def({ name: "mongo.findone", body: $mongo_findone });
func.def({ name: "mongo.insertone", body: $mongo_insertone });
func.def({ name: "mongo.insertmany", body: $mongo_insertmany });
func.def({ name: "mongo.updateone", body: $mongo_updateone });
func.def({ name: "mongo.updatemany", body: $mongo_updatemany });
func.def({ name: "mongo.deleteone", body: $mongo_deleteone });
func.def({ name: "mongo.deletemany", body: $mongo_deletemany });
func.def({ name: "mongo.listdbs", body: $mongo_listdbs });

