'use strict';

// 2020-12-01, v1
var CACHE_START_TEXT = 'CACHE MANIFEST',
	CACHE_END_TEXT = 'NETWORK';

/**
 * Delete all old service worker caches.
 * @returns {Promise} Resolves when all have been deleted
 */
function deleteOldCaches() {
	return caches.keys().then(function (cacheNames) {
		var cacheDeletionPromises = cacheNames.map(function (cacheName) {
			return caches.delete(cacheName);
		});
		return Promise.all(cacheDeletionPromises);
	});
}

self.addEventListener('install', function(ev) {
	ev.waitUntil(fetch('/manifest.appcache')
		.then(function (appCacheRequest) {
			return appCacheRequest.text();
		}).then(function (appCacheText) {
			// Remove any Windows line endings.
			appCacheText = appCacheText.replace(/\r/g, '');
			
			var startIndex = appCacheText.indexOf(CACHE_START_TEXT) + CACHE_START_TEXT.length + 1,
				endIndex = appCacheText.indexOf(CACHE_END_TEXT) - 2;
			if (endIndex === -3) { endIndex = appCacheText.length - 1; }
			var appCacheArray = appCacheText
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
			
			return deleteOldCaches()
				.then(function () {
					return caches.open(cacheName)
				})
				.then(function (cache) {
					// Add files individually to make debugging easier if something goes wrong.
					var cachePromises = appCacheArray.map(function (url) {
						return cache.add(url)
							.then(function () {
								console.log('Added to service worker cache: ' + url);
							}).catch(function (err) {
								console.error('Failed to add file to service worker cache: ' + url);
								console.error(err);
							});
					});
					return Promise.all(cachePromises);
				}).then(function () {
					console.log('Finished adding files to service worker cache.');
				});
		}));
});

self.addEventListener('fetch', function(ev) {
	// Do not attempt to load external requests from cache.
	if (ev.request.url.indexOf(self.origin) !== 0) {
		return fetch(ev.request);
	}
	
	// Handle any file open request specially.
	if (ev.request.method === 'POST' && new URL(ev.request.url).pathname === '/') {
		ev.request.formData().then(function (formData) {
			self.clients.get(ev.resultingClientId || ev.clientId).then(function (client) {
				var file = formData.get('file');
				client.postMessage({ file: file, action: 'load-image' });
			});
		});
	}
	
	var url = ev.request.url.split('?')[0].split('#')[0];
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
