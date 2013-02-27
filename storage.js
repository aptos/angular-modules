blitz.factory('Storage', function() {
	return {
		get: function(key) {
			if (this.implemented()) {
				var item = sessionStorage.getItem(key);
				try {
					return JSON.parse(item);
				}
				catch (e) {}
			}
			return null;
		},
		set: function(key, value) {
			if (this.implemented()) {
				var json = JSON.stringify(value);
				sessionStorage.setItem(key, json);
			}
		},
		implemented: function() {
			return (typeof sessionStorage!=="undefined");
		}
	};
});