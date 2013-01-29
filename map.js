var lmap = angular.module('leafletMap', []);

lmap.api_key = "abc";

lmap.factory('debounce',['$timeout', '$q', function($timeout, $q) {
  return function(func, wait, immediate) {
    var timeout;
    var deferred = $q.defer();
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if(!immediate) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
      };
      var callNow = immediate && !timeout;
      if ( timeout ) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        deferred.resolve(func.apply(context,args));
        deferred = $q.defer();
      }
      return deferred.promise;
    };
  };
}]);

// Use this directive to render a map. 
// drag events on the map will update center and bounds
// latlong will initialize the map with a pin dropped at the center of the map
//
// <div leaflet-map latlong="{{latLong}}" center="center" bounds="bounds" id="map" 
//     markers="{{markers}}" zoom="10" class="map-medium" ng-show="show_map"></div>
lmap.directive('leafletMap',[ 'debounce', function(debounce) {
  return {
    restrict: 'A',
    replace: true,
    template: "<div></div>",
    link: function(scope, element, attrs) {
      var latLong = attrs.latLong || [36.97, -121.89]
      var zoom = attrs.zoom || 10;
      var map = L.map('map');
      var tile = 'http://{s}.tile.cloudmade.com/' + lmap.api_key + '/997/256/{z}/{x}/{y}.png'
      var marker;
      var marker_group;
      var markers = new L.MarkerClusterGroup();
      var centermark = (attrs.centermark == "false") ? false : true;

      var render = function (latLong, zoom) {
        if (marker) { map.removeLayer(marker) }
        map.setView(latLong, zoom)
        L.tileLayer(tile, {
          maxZoom: 14,
          minZoom: 5
        }).addTo(map);
        if (centermark) {
          marker = new L.marker(latLong);
          map.addLayer(marker); 
        }
      }
      
      var addPoints = function (markers) {
        if (!markers) {return;}
        var points = [];
        if (marker_group) { 
          marker_group.clearLayers();
        }
        for (var i = 0; i < markers.length; i++) {
          var m = L.marker(markers[i].latLng).bindPopup(markers[i].title)
          points.push(m);
        }
        marker_group = L.layerGroup(points).addTo(map)
      };

      var addCluster = function (addressPoints) {
        if (markers) {
          markers.clearLayers(); 
        }
        for (var i = 0; i < addressPoints.length; i++) {
          var title = addressPoints[i].title;
          var marker = new L.Marker(addressPoints[i].latLng, { title: title });
          marker.bindPopup(title);
          markers.addLayer(marker);
        }
        map.addLayer(markers);
      };

      var updateCenterLatLng = debounce(function() {
        var mapCenter = map.getCenter();
        var centerLatLng = [mapCenter.lat, mapCenter.lng]
        scope[attrs.center] = centerLatLng;
        
        var mapBounds = map.getBounds();
        var boundsLatLng = [
          [mapBounds._southWest.lat, mapBounds._southWest.lng],
          [mapBounds._northEast.lat, mapBounds._northEast.lng]
        ]
        scope[attrs.bounds] = boundsLatLng;
        scope.$apply();
      },1000, false);
      
      map.on('drag', function(e) {
        updateCenterLatLng();
      });
      
      attrs.$observe('latlong', function(value) {
        if (!value) { return; }
        render(JSON.parse(value), zoom)
      })
      
      attrs.$observe('markers', function(value) {
        if (!value) { return; }
        addCluster(JSON.parse(value))
      })

      render(latLong, zoom);
      if (attrs.markers) { addCluster(attrs.markers); }
    }
  }
}]);

// Use this directive for an input field as follows:
// <input geocode placeholder="'city, state' or zipcode" ng-model="location" location="{{location}}" latlong="latlong">
lmap.directive('geocode',[ 'debounce', function(debounce) {
  return {
    restrict: 'A',
    require:'ngModel',
    replace: true,
    link: function(scope, element, attrs, ngModel) {

      var geocoder = new google.maps.Geocoder();
      var getLocation = debounce(
        function (location, callback) {
        if (!location) { return; }
        geocoder.geocode( { 'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          latLong = [ results[0].geometry.location["Ya"],results[0].geometry.location["Za"] ] ;
        } else {
          console.error("Geocode was not successful for the following reason: " + status);
        }
        callback(latLong);
        });
      }, 2000, false);
     
      attrs.$observe('location', function(value) {
        if (!value || value == "Remote") { return; }
        getLocation(value, function(response) {
          scope[attrs.latlong] = response;
          scope.$apply();
        });
      });
    }
  };
}]);

// Use this directive for an input field as follows:
// <input geocode placeholder="'city, state' or zipcode" ng-model="location" location="{{location}}" latlong="latlong">
lmap.directive('cm-geocode',[ 'debounce', function(debounce) {
  return {
    restrict: 'A',
    require:'ngModel',
    replace: true,
    link: function(scope, element, attrs, ngModel) {

      var geocoder = new CM.Geocoder(lmap.api_key);
      var getLocation = debounce(
        function (location, callback) {
        if (!location) { return; }
        geocoder.getLocations(location, function(response) {
          latLong =  [ 
            (response.bounds[1][0]+response.bounds[0][0])/2,
            (response.bounds[0][1]+response.bounds[1][1])/2 
          ];
          callback(latLong);
        });
      }, 2000, false);
     
      attrs.$observe('location', function(value) {
        if (!value || value == "Remote") { return; }
        getLocation(value, function(response) {
          scope[attrs.latlong] = response;
          scope.$apply();
        });
      });
    }
  };
}]);
