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
}
