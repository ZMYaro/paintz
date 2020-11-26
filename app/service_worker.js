'use strict';

var CACHE_START_TEXT = 'CACHE MANIFEST',
	CACHE_END_TEXT = 'NETWORK';

self.addEventListener('install', function(ev) {
	ev.waitUntil(fetch('/manifest.appcache')
		.then(function (appCacheRequest) {
			return appCacheRequest.text();
		}).then(function (appCacheText) {
			// Remove any Windows line endings.
			appCacheText = appCacheText.replace(/\r/g, '');
			
			var startIndex = appCacheText.indexOf(CACHE_START_TEXT) + CACHE_START_TEXT.length + 1,
				endIndex = appCacheText.indexOf(CACHE_END_TEXT) - 2,
				appCacheArray = appCacheText
					// Take only the CACHE MANIFEST section.
					.substring(startIndex, endIndex)
					// Remove any extra line breaks.
					.trim()
					// And split the list into an array.
					.split('\n'),
				// Get the cache name from the first line; the rest will be the list of URLs.
				cacheName = appCacheArray.splice(0, 1)[0].substring(2);
			
			// Precede each URL with a “/”.
			appCacheArray = appCacheArray.map(function (url) { return '/' + url });
			
			return caches.open(cacheName)
				.then(function (cache) {
					console.log('Opened cache: \u201c' + cacheName + '\u201d');
					return cache.addAll(appCacheArray);
				}).then(function () {
					console.log('Added files to service worker cache:\n' + appCacheArray.join('\n'));
				}).catch(function (err) {
					console.error('Service worker failed to cache files:');
					console.error(err);
				});
		}));
});

self.addEventListener('fetch', function(ev) {
	var url = ev.request.url;
	// Make any URL to a directory look for index.html in that directory.
	if (url.substr(-1) === '/') {
		url += 'index.html';
	}
	ev.respondWith(caches.match(url)
		.then(function(response) {
			if (response) {
				return response;
			}
			return fetch(ev.request);
		}));
});
