define(['underscore', 'lib/routecolors'],
       function(_, Colors) {

    var route_cache = {};

    var routes = function() {
        return _.keys(route_cache);
    };

    var getRoute = function(route_id) {
        return route_cache[route_id];
    };

    $.ajax({url: "/routes"}).done(function(res) {
        route_cache = res;
        Colors.refreshColors(routes());
    });

    var Routes = {};

    Routes.routes = routes;
    Routes.getRoute = getRoute;

    return Routes;

});
