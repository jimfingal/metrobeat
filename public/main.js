require.config({
    'baseUrl': '.',
    'paths': {
      'jquery': 'bower_components/jquery/dist/jquery.min',
      'jquery-ui': 'bower_components/jquery-ui/ui/jquery-ui',
      'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
      'socket.io' : 'bower_components/socket.io-client/socket.io',
      'leaflet': "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet",
      'esri-leaflet': "lib/esri-leaflet",
      'clusterfck': "lib/clusterfck",
      'underscore' : 'bower_components/underscore/underscore',
      'tinycolor' : 'bower_components/tinycolor/tinycolor'
    },
    'shim': {
        'jquery': {
            exports: 'jQuery'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'bootstrap': {
          deps: ['jquery']
        },
        'leaflet': {
            exports: 'L'
        },
        'clusterfck': {
            exports: 'clusterfck'
        },
        'esri-leaflet': {
          deps: ['leaflet']
        }
    },
    'waitSeconds' : 0
});


require(['lib/sockethelper', 'lib/map', 'jquery', 'bootstrap'],
  function(sockethelper, initializeMap, $) {

    var socket = sockethelper.getSocket();
    initializeMap(socket);
    
});

