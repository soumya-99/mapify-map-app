const mapifyMapApp = "mapify-map-app"
const assets = [
	"/",
	"/index.html",
	"/disclaimer.html",
	"/css/map.css",
	"/css/material-icons.css",
	"/css/disclaimer.css",
	"/scripts/map.js",
	"/scripts/algorithm.js",
	"/fonts/GoogleSans-Medium.ttf",
	"/ico/tab-ico.png",
	"/libs/materialize/css/materialize.min.css",
	"/libs/materialize/js/materialize.min.js",
	"/utils/lottie-player.js",
	"/utils/material-theme-control.js",
	"/utils/animations/86746-loading-blash.json",
	"/maps/Abstract_Maps/absMap3.png",
	"/maps/Real_Maps/gMaps5.png",
	"/maps/Real_Maps/gMaps6.png",
	"/maps/Real_Maps/gMaps7.png",
	"/maps/Real_Maps/gMaps8.png",
	"/maps/Real_Maps/gMaps9.png",
	"/maps/Industries/indMap1.jpg",
	"/maps/Industries/indMap2.jpg",
	"/maps/Industries/indMap3.png",
	"/sounds/party-trumpet.wav",
]

self.addEventListener("install", (e) => {
	e.waitUntil(async () => {
		const cache = await caches.open(mapifyMapApp)
		await cache.addAll(assets)
	})
})

// fetch new cache data
self.addEventListener("fetch", (e) => {
	e.respondWith(async () => {
		const r = await caches.match(e.request)
		if (r) {
			return r
		}
		const response = await fetch(e.request)
		const cache = await caches.open(cacheName)
		cache.put(e.request, response.clone())
		return response
	})
})

// clear old caches
self.addEventListener("activate", (e) => {
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key === mapifyMapApp) {
						return
					}
					return caches.delete(key)
				})
			)
		})
	)
})
