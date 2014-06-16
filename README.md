Metrobeat
=============

Eventually, something cool.

Right now, just collecting data.




## Replay

Take all of the updates for a day and replay them on the map.

- Front-end inputs
-- Bar that shows time of day
-- Setting for how fast to go through the day
-- Pause animation

Information Needed
- Historical Set. How stored?
-- Raw: set of "moments" from [real-time API|http://developer.metro.net/introduction/realtime-api-overview/] that look like:
```json
{
        "_id" : ObjectId("5392386c75148d02009828e0"),
        "seconds_since_report" : 5,
        "run_id" : "240_126_0",
        "longitude" : -118.535957,
        "heading" : 180,
        "route_id" : "240",
        "predictable" : true,
        "latitude" : 34.208046,
        "id" : "8297",
        "snapshot_ts" : 1402091626891,
        "geo" : [
                -118.535957,
                34.208046
        ]
}
```
-- Roughly corresponds to documentation here: http://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf
-- Ultimately we care about both chunks of time, and individual vehicles. To render:
--- Vehicle ID
--- Snapshot_ts
--- Geo
--- Heading
-- Initially we don't care as much about other fields

General operation, depending on the batch of data, will look something like:
```javascript

db.moments.aggregate([{ $match: { 'snapshot_ts' : { $gt: 1402531200000, $lt: 1402617599999 }} }, { $sort: {'snapshot_ts': 1}}, { $project : {'id': 1, 'heading': 1, 'geo': 1, 'snapshot_ts' : 1}}], {'allowDiskUse': true, cursor: { batchSize: 0 }} )

```

In a given day, there are almost 400k moments in the system.

```javascript
 db.moments.find({ 'snapshot_ts' : { $gt: 1402531200000, $lt: 1402617599999 }}).count()
394507
```

- Front-end stuff needed
-- Build a cache of movements
-- Scheduling animations between movements


Backend
- Ability to stream a day's worth of data to the client
- Back and forth -- client ask for particular batch depending on what already have, what care about
- Visualize what part of batch has been stored


### TODO

GIS data: http://developer.metro.net/introduction/gis-data/
GTFS feeds: http://developer.metro.net/introduction/gtfs-data/

