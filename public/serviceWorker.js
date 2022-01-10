const CACHE_NAME = "budgettracker-cache";
const DATA_CACHE_NAME = "budgettracker-data-cache";

const FILES_TO_CACHE = [
	"/index.html",
	"/css/styles.css",
	"/js/index.js",
	"/js/idb.js",
	"/manifest.json",
	"/icons/icon-512x512.png",
	"/icons/icon-384x384.png",
	"/icons/icon-192x192.png",
	"/icons/icon-152x152.png",
	"/icons/icon-144x144.png",
	"/icons/icon-128x128.png",
	"/icons/icon-96x96.png",
	"/icons/icon-72x72.png"
];

// Install
self.addEventListener("install", function (evt) {
	// pre cache all static assets
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Your files were pre-cached successfully!");
			return cache.addAll(FILES_TO_CACHE);
		})
	);
});

// Tell the browser to activate this service worker immediately once it has finished installing
self.skipWaiting();

// Activate
self.addEventListener("activate", function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log("Removing old cache data", key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

// Fetch
self.addEventListener("fetch", function (evt) {
	if (evt.request.url.includes("/api/")) {
		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(evt.request)
						.then((response) => {
							// If the response was good, clone it and store it in the cache.
							if (response.status === 200) {
								cache.put(evt.request.url, response.clone());
							}
							return response;
						})
						.catch((err) => {
							// Network request failed, try to get it from the cache.
							return cache.match(evt.request);
						});
				})
				.catch((err) => console.log(err))
		);
		return;
	}

	evt.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(evt.request).then((response) => {
				return response || fetch(evt.request);
			});
		})
	);
});
