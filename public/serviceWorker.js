const CACHE_NAME = "budgettracker-cache";
const DATA_CACHE_NAME = "budgettracker-data-cache";

const FILES_TO_CACHE = [
	"./index.html",
	"./css/styles.css",
	"./js/index.js",
	"./js/idb.js",
	"./manifest.json",
	"./icons/icon-512x512.png",
	"./icons/icon-384x384.png",
	"./icons/icon-192x192.png",
	"./icons/icon-152x152.png",
	"./icons/icon-144x144.png",
	"./icons/icon-128x128.png",
	"./icons/icon-96x96.png",
	"./icons/icon-72x72.png"
];

self.addEventListener("install", function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
	);
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (keyList) {
			let cacheKeeplist = keyList.filter(function (key) {
				return key.indexOf(CACHE_NAME);
			});
			cacheKeeplist.push(CACHE_NAME);

			return Promise.all(
				keyList.map(function (key, i) {
					if (cacheKeeplist.indexOf(key) === -1) {
						return caches.delete(keyList[i]);
					}
				})
			);
		})
	);
});

self.addEventListener("fetch", function (event) {
	event.respondWith(
		caches.match(event.request).then(function (request) {
			if (request) {
				return request;
			} else {
				return fetch(event.request);
			}
		})
	);
});
