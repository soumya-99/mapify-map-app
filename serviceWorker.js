var GHPATH = "/mapify-map-app"
var APP_PREFIX = "mapify_"
var VERSION = "version_002"
var CACHE_NAME = APP_PREFIX + VERSION
const assets = [
	`${GHPATH}/`,
	`${GHPATH}/index.html`,
	`${GHPATH}/disclaimer.html`,
	`${GHPATH}/css/map.css`,
	`${GHPATH}/css/material-icons.css`,
	`${GHPATH}/css/disclaimer.css`,
	`${GHPATH}/scripts/map.js`,
	`${GHPATH}/scripts/algorithm.js`,
	`${GHPATH}/fonts/GoogleSans-Medium.ttf`,
	`${GHPATH}/ico/tab-ico.png`,
	`${GHPATH}/libs/materialize/css/materialize.min.css`,
	`${GHPATH}/libs/materialize/js/materialize.min.js`,
	`${GHPATH}/utils/lottie-player.js`,
	`${GHPATH}/utils/material-theme-control.js`,
	`${GHPATH}/utils/animations/86746-loading-blash.json`,
	`${GHPATH}/maps/Abstract_Maps/absMap3.png`,
	`${GHPATH}/maps/Real_Maps/gMaps5.png`,
	`${GHPATH}/maps/Real_Maps/gMaps6.png`,
	`${GHPATH}/maps/Real_Maps/gMaps7.png`,
	`${GHPATH}/maps/Real_Maps/gMaps8.png`,
	`${GHPATH}/maps/Real_Maps/gMaps9.png`,
	`${GHPATH}/maps/Industries/indMap1.jpg`,
	`${GHPATH}/maps/Industries/indMap2.jpg`,
	`${GHPATH}/maps/Industries/indMap3.png`,
	`${GHPATH}/sounds/party-trumpet.wav`,
]

self.addEventListener("install", (e) => {
	e.waitUntil(async () => {
		const cache = await caches.open(CACHE_NAME)
		await cache.addAll(assets)
	})
})

self.addEventListener("fetch", (fetchEvent) => {
	fetchEvent.respondWith(
		caches.match(fetchEvent.request).then((res) => {
			return res || fetch(fetchEvent.request)
		})
	)
})

self.addEventListener("activate", (e) => {
	e.waitUntil(
		caches.keys().then(function (keyList) {
			var cacheWhitelist = keyList.filter((key) => {
				return key.indexOf(APP_PREFIX)
			})
			cacheWhitelist.push(CACHE_NAME)
			return Promise.all(
				keyList.map((key, i) => {
					if (cacheWhitelist.indexOf(key) === -1) {
						console.log("Deleting cache : " + keyList[i])
						return caches.delete(keyList[i])
					}
				})
			)
		})
	)
})
