const maifyMapApp = "mapify-map-app"
const assets = [
	"/",
	"/index.html",
	"/css/map.css",
	"/css/material-icons.css",
	"/css/disclaimer.css",
	"scripts/map.js",
	"scripts/algorithm.js",
	"/fonts/GoogleSans-Medium.ttf",
	"/ico/tab-ico.png",
	"/libs/css/materialize.min.css",
	"/libs/js/materialize.min.js",
	"/maps/Abstract_Maps/absMap3.png",
	"./maps/Real_Maps/gMaps5.png",
	"./maps/Real_Maps/gMaps6.png",
	"./maps/Real_Maps/gMaps7.png",
	"./maps/Real_Maps/gMaps8.png",
	"./maps/Real_Maps/gMaps9.png",
	"./maps/Industries/indMap1.jpg",
	"./maps/Industries/indMap2.jpg",
	"./maps/Industries/indMap3.jpg",
	"/sounds/party-trumpet.wav",
]

self.addEventListener("install", (installEvent) => {
	installEvent.waitUntil(
		caches.open(maifyMapApp).then((cache) => {
			cache.addAll(assets)
		})
	)
})

self.addEventListener("fetch", (fetchEvent) => {
	fetchEvent.respondWith(
		caches.match(fetchEvent.request).then((res) => {
			return res || fetch(fetchEvent.request)
		})
	)
})
