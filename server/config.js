var config = {};

config.mongo = {};
config.web = {};
config.metro = {};
config.geo = {};
config.process = {};
config.lang = {};

config.web.PORT = process.env.PORT || 3000;

config.process.SHUTDOWN_WAIT = 2;


config.geo.mapconfig = {
    "center": {
        "latitude" : 33.95,
        "longitude": -118.2
    },
    "zoom": 10
};

var DB_NAME = "metrobeat";
config.mongo.UPDATE_COLLECTION = "moments";

config.mongo.LOCAL_CONNECTION = "mongodb://127.0.0.1:27017/" + DB_NAME;
config.mongo.CONNECTION = process.env.MONGOHQ_URL || config.mongo.LOCAL_CONNECTION;
config.mongo.LOCAL_MONGOHQ = process.env.LOCAL_MONGOHQ;


module.exports = config;
