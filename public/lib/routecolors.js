define(['underscore', 'tinycolor'], function(_, tinycolor) {

    var tron_cyan = "#6FC3DF";
    var tron_orange = "#DF740C";
    var tron_yellow = "#FFE64D";

    var colors = [tron_cyan, tron_yellow, tron_orange];
    var code_to_color = {};


    var getRouteColor = function(route) {
      if (code_to_color[route]) {
        return code_to_color[route];
      } else {
        return "#6FC3DF";
      }
    };

    var refreshColors = function(routes) {

      var total = routes.length;

      var i = 0;
      _.each(routes, function(route) {
          i++;
          var color = tinycolor("hsv " + ((i / total) * 360) + " 100 75").toHexString();
          code_to_color[route] = color;
      });
    };

    var Colors = {};

    Colors.getRouteColor = getRouteColor;
    Colors.refreshColors = refreshColors;

    return Colors;

});
