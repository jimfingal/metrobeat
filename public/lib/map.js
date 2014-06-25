define(['jquery', 'leaflet', 'underscore', 'lib/replay', 'lib/realtime', 'lib/markerhelper',
          'esri-leaflet', 'jquery-ui', 'bootstrap'],
          function($, L, _, Replay, Realtime, MarkerHelper) {

    var initializeMap = function(socket) {

      $.ajax({url: "/mapconfig"}).done(function(mapconfig) {

          var point = [mapconfig['center']['latitude'], mapconfig['center']['longitude']];

          var map = L.map('map', {
            //'maxZoom': 15
          }).setView(point, mapconfig['zoom']);

          L.esri.basemapLayer("Gray").addTo(map);

          var marker_helper = new MarkerHelper(map);

          Realtime.init(socket, marker_helper);
          replay = new Replay(socket, marker_helper);

          Realtime.start(socket);

          $('#replay').click(function() {
            console.log('Replay selected');
            Realtime.stop(socket, marker_helper);
            replay.start(socket);
          });

          $('#realtime').click(function() {
            console.log('Real-time selected');
            replay.stop(socket);
            Realtime.start(socket);
          });

        });
    };

    return initializeMap;

});
