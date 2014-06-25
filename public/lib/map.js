define(['jquery', 'leaflet', 'underscore', 'lib/replay', 'lib/realtime',
          'esri-leaflet', 'jquery-ui', 'bootstrap'],
          function($, L, _, Replay, Realtime) {

    var initializeMap = function(socket) {

      $.ajax({url: "/mapconfig"}).done(function(mapconfig) {

          var point = [mapconfig['center']['latitude'], mapconfig['center']['longitude']];

          var map = L.map('map', {
            //'maxZoom': 15
          }).setView(point, mapconfig['zoom']);

          L.esri.basemapLayer("Gray").addTo(map);

          Realtime.init(socket, map);
          Replay.init(socket, map);

          Realtime.start(socket);

          $('#replay').click(function() {
            console.log('Replay selected');
            Replay.stop(socket);
            Realtime.start(socket);
          });

          $('#realtime').click(function() {
            console.log('Real-time selected');
            Realtime.stop(socket);
            Replay.start(socket);
          });

        });
    };

    return initializeMap;

});
