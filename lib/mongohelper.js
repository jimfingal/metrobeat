
var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var gracefulshutdown = require('./gracefulshutdown');
var config = require('./config');
var async = require('async');

var MongoClient = require('mongodb').MongoClient;
var db;

var initialized = false;
var closed = false;

var closeConnection = function() {
    if (!closed) {
        db.close();
        closed = true;
    }
};



var insertDocumentIntoDB = function(provided_db, collection, doc, async_callback) {

   provided_db.collection(collection).insert(doc, function(err, inserted) {
        if (err) {
          if (async_callback) {
              async_callback(err, inserted['_id']);
          }
        }
        if (async_callback) {
          async_callback(null, inserted['_id']);
        }
    });

};


var insertDocument = function(collection, doc, async_callback) {
   insertDocumentIntoDB(db, collection, doc, async_callback);
};

var insertDocumentIfDoesntExist = function(collection, doc, async_callback) {

  db.collection(collection).findOne({'_id': doc['_id']}, function(err, exists) {
    if (err) {
      if (async_callback) {
        async_callback(err, 'error inserting doc');
      }
    } else {
      if (exists) {
        if (async_callback) {
          async_callback(null, doc['_id']);
        }
      } else {
        insertDocument(collection, doc, async_callback);
      }
    }
  });
};


var find = function(collection, query, callback) {
    db.collection(collection).find(query).toArray(callback);
};

var getDB = function() {
    return db;
};

var initDb = function(callback) {

  if (callback === undefined) {
    callback = function() {};
  }

  if (!initialized) {
      MongoClient.connect(config.mongo.CONNECTION, function(err, database) {
        if (err) {
          throw err;
        } else {
          initialized = true;
        }
        db = database;
        gracefulshutdown.addShutdownCallback(closeConnection);
        callback();
    });
  } else {
    callback();
  }
};


var copyCollection = function(from_conn, from_coll, to_conn, to_coll) {
  console.log("From: " + from_conn);
  console.log("From Coll: " + from_coll);
  console.log("To: " + to_conn);
  console.log("From coll: " + to_coll);

  MongoClient.connect(from_conn, function(err, db) {
    if (err) throw err;
    db.collection(from_coll).find().toArray(function(err, documents) {
        if (err) throw err;
        MongoClient.connect(to_conn, function(err2, db2) {
           if (err2) throw err2;

           var inserts = [];
            _.each(documents, function(doc) {
              inserts.push(function(callback) {
                  insertDocumentIntoDB(db2, to_coll, doc, callback);
              });
            });

            async.parallel(inserts, function(err, results) {
                db2.close();
                db.close();
            });
        });
    });

  });
};


var mapReduce = function(collection, mapper, reducer, scope, callback) {

   db.collection(collection).mapReduce(
        mapper,
        reducer,
        scope,
        callback
    );
};

var aggregate = function(collection, aggregate_list, callback) {

   db.collection(collection).aggregate(
        aggregate_list,
        callback
    );
};


module.exports.insertDocumentIfDoesntExist = insertDocumentIfDoesntExist;
module.exports.insertDocument = insertDocument;
module.exports.find = find;
module.exports.initDb = initDb;
module.exports.copyCollection = copyCollection;
module.exports.mapReduce = mapReduce;
module.exports.aggregate = aggregate;
