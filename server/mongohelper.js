
var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var gracefulshutdown = require('./gracefulshutdown');
var config = require('./config');

var MongoClient = require('mongodb').MongoClient;
var db;

var closed = false;

var closeConnection = function() {
    if (!closed) {
        db.close();
        closed = true;
    }
};

// Initialize connection once
MongoClient.connect(config.mongo.CONNECTION, function(err, database) {
  if (err) throw err;
  db = database;
  gracefulshutdown.addShutdownCallback(closeConnection);
});


var logError = function(err, inserted) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
};

var insertDocument = function(collection, doc) {
    db.collection(collection).insert(doc, logError);
};

var addObjectId = function(doc, id_str) {
  // TODO
};


module.exports.insertDocument = insertDocument;
module.exports.addObjectId = addObjectId;
