/* http://docs.angularjs.org/#!angular.filter */
var appFilters = angular.module('appFilters', [])

appFilters.filter('timeAgo', function() {
	return function(dateString, format) {
		return moment(dateString).fromNow();
	};
});

appFilters.filter('moment', function() {
	return function(dateString, format) {
		if (!dateString) { return "-"; }
		if (format) {
			if (format == "timeago") {
				return moment(dateString).fromNow();
			} else {
				return moment(dateString).format(format);
			}
		} else {
			return moment(dateString).format("YY-M-D");
		};
	}
});