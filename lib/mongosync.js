var config = require('./config');
var mongohelper = require('./mongohelper');
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));

var collection_from = argv._[0];
var collection_to = argv._[1];


assert(collection_from, 'Must have a collection name');

if (!collection_to) {
    collection_to = collection_from;
}

if (argv['syncfromremote']) {
    mongohelper.copyCollection(config.mongo.LOCAL_MONGOHQ, collection_from,
                               config.mongo.LOCAL_CONNECTION, collection_to);
} else if (argv['synctoremote']) {
    mongohelper.copyCollection(config.mongo.LOCAL_CONNECTION, collection_from,
                                config.mongo.LOCAL_MONGOHQ, collection_to);
}

/* Instead, use something like:

mongodump --collection moments --db metrobeat

mongorestore --host kahana.mongohq.com:10060 
            --db app26093627 
            --username heroku 
            --password {{password}} 
            --collection moments dump/metrobeat/moments.bson

*/

/*

db.moments.find().forEach(
    function (elem) {
        db.moments.update(
            {
                _id: elem._id
            },
            {
                $set: {
                    geo: [ elem.longitude, elem.latitude]
                }
            }
        );
    }
);

*/
