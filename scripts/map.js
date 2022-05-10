// buttons
const srcButton = document.getElementById("source")
const destButton = document.getElementById("dest")
const showPathButton = document.getElementById("sp")
const resetButton = document.getElementById("reset")
const help = document.getElementById("help")
const aboutUs = document.getElementById("aboutus")
const fullScreenButton = document.getElementById("fullscreen")
const downloadButton = document.getElementById("download")
const mainBody = document.getElementById("main-body")
const zoomButton = document.getElementById("zoom-icon")
const rightOfMap = document.getElementById("other-than-map")
const mapContainer = document.getElementById("map-container")
const cols7 = document.getElementById("cols7")
const zoomRange = document.getElementById("zoom-range")
let zoomOn = false
let zoomValue

// image related
let img = document.getElementById("map-image")
let actualImageWidth = img.width
let actualImageHeight = img.height

// set up the canvas
let canvas = document.getElementById("canvas")
canvas.width = img.width
canvas.height = img.height
let context = canvas.getContext("2d")

// algo related
let sourceSet = false,
	destSet = false
let srcButtonOn = false,
	destButtonOn = false //state of buttons
let source, destination

const box_dimensions = 2
let maxX = canvas.width / box_dimensions //image loading needs to be done before this
let maxY = canvas.height / box_dimensions //cause accessing the canvas element here
let vertex = maxX * maxY //maximum possible number of veritces

img.onload = () => {
	context.drawImage(img, 0, 0, img.width, img.height)
}

//this is called everytime mouse is clicked
function pick(event) {
	var rect = canvas.getBoundingClientRect() // get the canvas' bounding rectangle
	let mx = event.clientX - rect.left // get the mouse's x coordinate
	let my = event.clientY - rect.top // get the mouse's y coordinate
	if (compareColorValues(mx, my) === false) {
		return //don't let add src or dest outside paths
	}

	let hotCell = findVertexAtCoordinate(mx, my)

	if (destSet === false && destButtonOn === true) {
		destination = hotCell
		colorImagePixels(mx, my, 6, 0, 255, 0)
		destSet = true
		destButtonOn = false
		return
	}
	if (sourceSet === false && srcButtonOn === true) {
		source = hotCell
		colorImagePixels(mx, my, 6, 0, 0, 255)
		sourceSet = true
		srcButtonOn = false
		return
	}
}

//////////////////////////////////

function swapMap() {
	let newImage = document.getElementById("mapSelect")
	img.src = newImage.value
	// console.log(img.width, img.height)
	canvas.width = img.width
	canvas.height = img.height
	maxX = canvas.width / box_dimensions
	maxY = canvas.height / box_dimensions
	vertex = maxX * maxY
	img.onload = () => {
		context.drawImage(img, 0, 0, img.width, img.height)
	}
	resetStates()
}

resetButton.onclick = () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	let img = document.getElementById("map-image")
	let newImage = document.getElementById("mapSelect")
	img.src = newImage.value
	canvas.width = img.width
	canvas.height = img.height
	maxX = canvas.width / box_dimensions
	maxY = canvas.height / box_dimensions
	vertex = maxX * maxY
	img.onload = () => {
		context.drawImage(img, 0, 0, img.width, img.height)
	}
	resetStates()
}

function resetStates() {
	predFromSource.clear()
	predFromDest.clear()
	sourceQueue = new Array()
	destQueue = new Array()
	sourceVisited = new Array(vertex).fill(false)
	destVisited = new Array(vertex).fill(false)

	sourceSet = false
	destSet = false
	srcButtonOn = false
	destButtonOn = false
	pathFound = false
	zoomRange.value=1
	if (zoomOn == false) {
		srcButton.classList.remove("disabled")
		destButton.classList.remove("disabled")
	}
}

//methods for buttons
function show_path(event) {
	bfsManager(source, destination) //all methods combined
	if (pathFound) 
		highLightPath()
	resetStates()	//need to reset after every bfs call

	img.src = canvas.toDataURL();
}

destButton.onclick = (e) => {
	destSet = false
	destButtonOn = true
	destButton.classList.add("disabled")
	srcButton.classList.add("disabled")
}

srcButton.onclick = (e) => {
	sourceSet = false
	srcButtonOn = true
	srcButton.classList.add("disabled")
	destButton.classList.add("disabled")
}

showPathButton.onclick = (event) => {
	if (sourceSet && destSet) show_path(event)
	else M.toast({ html: "Add source and destination first", classes: "rounded" })
}

fullScreenButton.onclick = (e) => {
	canvas.requestFullscreen()
}

downloadButton.onclick = () => {
	downloadButton.download = img.src
	downloadButton.href = canvas.toDataURL()
}
zoomButton.onclick = () => {
	if (zoomOn == false) {
		srcButton.classList.add("disabled")
		destButton.classList.add("disabled")
		showPathButton.classList.add("disabled")
		// resetButton.classList.add("disabled")
		rightOfMap.classList.add("display-none")
		mapContainer.classList.remove("map-container-default-view")
		mapContainer.classList.add("map-container-detailed-view")
		cols7.style.width = "100%"
		mainBody.classList.add("row-width")
		zoomRange.classList.remove("zoom-range-default")
		zoomRange.classList.add("zoom-range")
		zoomOn = true
	}
	else if (zoomOn == true) {
		srcButton.classList.remove("disabled")
		destButton.classList.remove("disabled")
		showPathButton.classList.remove("disabled")
		// resetButton.classList.remove("disabled")
		rightOfMap.classList.remove("display-none")
		mapContainer.classList.remove("map-container-detailed-view")
		mapContainer.classList.add("map-container-default-view")
		cols7.style.width = "fit-content"
		mainBody.classList.remove("row-width")
		zoomRange.classList.remove("zoom-range")
		zoomRange.classList.add("zoom-range-default")
		// swapMap()
		zoom_in(1)
		zoomOn = false
	}
}
function zoom_in(value) {
	// img.src = canvas.toDataURL();
	context.clearRect(0, 0, canvas.width, canvas.height);
	// img.width = actualImageWidth * value
	// img.height = actualImageHeight * value
	canvas.width = actualImageWidth * value
	canvas.height = actualImageHeight * value
	zoomRange.value=value
	// context.drawImage(img, 0, 0, img.width, img.height)
	context.drawImage(img, 0, 0, canvas.width, canvas.height)
	// console.log("here")
	// console.log(img.width, img.height)
}
zoomRange.onchange = () => {
	zoomValue = zoomRange.value
	zoom_in(zoomValue)
	// console.log(zoomValue)
}

canvas.addEventListener(
	"click",
	(event) => {
		pick(event)

		if (srcButtonOn || destButtonOn || zoomOn) {
			srcButton.classList.add("disabled")
			destButton.classList.add("disabled")
		} else {
			srcButton.classList.remove("disabled")
			destButton.classList.remove("disabled")
		}
	},
	false
)

// Complete themeing (Material You)

// themed buttons
const floatingButton = document.getElementById("floating-action")

const materialBlue = document.getElementById("m-blue")
const materialYellow = document.getElementById("m-yellow")
const materialRed = document.getElementById("m-red")
const materialGreen = document.getElementById("m-green")
const materialPurple = document.getElementById("m-purple")
const materialTeal = document.getElementById("m-teal")
const materialColorful = document.getElementById("m-colorful")

const COLORS = [
	"red",
	"green",
	"blue",
	"orange",
	"purple",
	"pink",
	"cyan",
	"indigo",
	"teal",
]
const NAV_BUTTONS = [
	srcButton,
	destButton,
	showPathButton,
	resetButton,
	help,
	fullScreenButton,
	downloadButton,
]

const navBar = document.getElementsByTagName("nav")[0]
const footer = document.getElementsByTagName("footer")[0]

const fbButton = document.getElementById("link-fb")
const githubButton = document.getElementById("link-github")
const twitterButton = document.getElementById("link-twitter")
const instaButton = document.getElementById("link-insta")

const SOCIAL_BUTTONS = [fbButton, githubButton, twitterButton, instaButton]

const card1 = document.getElementById("card-1")
const card2 = document.getElementById("card-2")
const card3 = document.getElementById("card-3")

const CARDS = [card1, card2, card3]

const srcIcon = document.getElementById("src-icon")
const destIcon = document.getElementById("dest-icon")
const spIcon = document.getElementById("sp-icon")
const resetIcon = document.getElementById("reset-icon")
const helpIcon = document.getElementById("help-icon")
const fullscreenIcon = document.getElementById("fullscreen-icon")
const downloadIcon = document.getElementById("download-icon")

const ICONS = [
	srcIcon,
	destIcon,
	spIcon,
	resetIcon,
	helpIcon,
	fullscreenIcon,
	downloadIcon,
]

let currentTheme = 0

materialBlue.onclick = (e) => {
	currentTheme = 1
	let isChecked = document.getElementById("switch-dark").checked
	console.log(isChecked)
	console.log(currentTheme)
	if (isChecked) {
		document.body.style.backgroundImage =
			"linear-gradient(to right, #001946, #5d8ef3)"
		navBar.style.backgroundColor = "rgba(30, 136, 229, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"

		COLORS.forEach((color) => {
			if (
				footer.classList.contains(color) ||
				footer.classList.contains("blue")
			) {
				footer.classList.remove("blue")
				footer.classList.remove(color)
			}
			footer.classList.add("blue")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("blue")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("blue", "darken-4")
				ICONS.forEach((icon) => {
					icon.style.color = "#d8e2ff"
				})
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
					card.classList.remove("darken-2")
				}
				card.style.backgroundColor = "#00429c"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("blue", "darken-4")
				button.style.color = "#d8e2ff"
			})
		})
	} else {
		navBar.style.backgroundColor = "rgba(30, 136, 229, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to left, #e3f2fd, #90caf9)"

		COLORS.forEach((color) => {
			if (
				footer.classList.contains(color) ||
				footer.classList.contains("blue")
			) {
				footer.classList.remove("blue")
				footer.classList.remove(color)
			}
			footer.classList.add("blue")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("blue")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("blue", "lighten-5")
				ICONS.forEach((icon) => {
					icon.style.color = "dodgerblue"
				})
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#1e5abc"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("blue", "lighten-5")
				button.style.color = "dodgerblue"
			})
		})
	}
}

materialGreen.onclick = (e) => {
	currentTheme = 2
	let isChecked = document.getElementById("switch-dark").checked
	console.log(isChecked)
	console.log(currentTheme)
	if (isChecked) {
		document.body.style.backgroundImage =
			"linear-gradient(to right, #00210C, #2ba561)"
		navBar.style.backgroundColor = "rgba(102, 187, 106, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("green")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}

			floatingButton.classList.add("green")
			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("green", "darken-4")
				ICONS.forEach((icon) => {
					icon.style.color = "#d8ffe2"
				})
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
					card.classList.remove("darken-2")
				}
				card.style.backgroundColor = "#005229"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("green", "darken-4")
				button.style.color = "#d8ffe2"
			})
		})
	} else {
		navBar.style.backgroundColor = "rgba(102, 187, 106, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to right, #81c784, #e8f5e9)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("green")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("green")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("green", "lighten-5")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "forestgreen"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#006d38"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("green", "lighten-5")
				button.style.color = "forestgreen"
			})
		})
	}
}

materialRed.onclick = (e) => {
	currentTheme = 3
	let isChecked = document.getElementById("switch-dark").checked
	if (isChecked) {
		document.body.style.backgroundImage =
			"linear-gradient(to right, #400010, #ff4f75)"
		navBar.style.backgroundColor = "rgba(239, 83, 80, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("red")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("red")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("red", "darken-4")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#ffdade"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
					card.classList.remove("darken-2")
				}
				card.style.backgroundColor = "#910030"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("red", "darken-4")
				button.style.color = "#ffdade"
			})
		})
	} else {
		navBar.style.backgroundColor = "rgba(239, 83, 80, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to right, #e57373, #ffebee)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("red")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("red")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("red", "lighten-5")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#f44336"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#ba0f44"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("red", "lighten-5")
				button.style.color = "#f44336"
			})
		})
	}
}

materialYellow.onclick = (e) => {
	currentTheme = 4
	let isChecked = document.getElementById("switch-dark").checked
	if (isChecked) {
		document.body.style.backgroundImage =
			"linear-gradient(to right, #390c00, #ed6833)"
		navBar.style.backgroundColor = "rgba(255, 183, 77, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("orange")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("orange")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("orange", "darken-4")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#ffdbce"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
					card.classList.remove("darken-2")
				}
				card.style.backgroundColor = "#822700"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("orange", "darken-4")
				button.style.color = "#ffdbce"
			})
		})
	} else {
		navBar.style.backgroundColor = "rgba(255, 183, 77, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to right, #ffcc80, #fff3e0)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("orange")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("orange")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("orange", "lighten-5")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "orange"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#a93800"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("orange", "lighten-5")
				button.style.color = "orange"
			})
		})
	}
}

materialPurple.onclick = (e) => {
	currentTheme = 5
	let isChecked = document.getElementById("switch-dark").checked
	if (isChecked) {
		document.body.style.backgroundImage =
			"linear-gradient(to right, #2f004c, #be6df2)"
		navBar.style.backgroundColor = "rgba(186, 104, 200, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("purple")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("purple")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("purple", "darken-4")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#f6d9ff"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
					card.classList.remove("darken-2")
				}
				card.style.backgroundColor = "#6d14a0"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("purple", "darken-4")
				button.style.color = "#f6d9ff"
			})
		})
	} else {
		navBar.style.backgroundColor = "rgba(186, 104, 200, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to right, #ba68c8, #f3e5f5)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("purple")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("purple")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("purple", "lighten-5")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#ab47bc"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#8736ba"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("purple", "lighten-5")
				button.style.color = "#ab47bc"
			})
		})
	}
}

materialTeal.onclick = (e) => {
	currentTheme = 6
	let isChecked = document.getElementById("switch-dark").checked
	if (isChecked) {
		document.body.style.background = "#011f22"
		document.body.style.backgroundImage =
			"linear-gradient(to right, #011f22, #00a0ac)"
		navBar.style.backgroundColor = "rgba(77, 182, 172, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("teal")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("teal")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("teal", "darken-4")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#7cf4ff"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#004f56"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("teal", "darken-4")
				button.style.color = "#7cf4ff"
			})
		})
	} else {
		navBar.style.backgroundColor = "rgba(77, 182, 172, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to right, #4db6ac, #e0f2f1)"

		COLORS.forEach((color) => {
			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("teal")

			if (floatingButton.classList.contains(color)) {
				floatingButton.classList.remove(color)
			}
			floatingButton.classList.add("teal")

			NAV_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("lighten-5") ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("lighten-5")
					button.classList.remove("darken-4")
				}
				button.classList.add("teal", "lighten-5")
			})

			ICONS.forEach((icon) => {
				icon.style.color = "#26a69a"
			})

			CARDS.forEach((card) => {
				if (
					card.classList.contains(color) ||
					card.classList.contains("darken-2")
				) {
					card.classList.remove(color)
				}
				card.style.backgroundColor = "#006972"
			})

			SOCIAL_BUTTONS.forEach((button) => {
				if (
					button.classList.contains(color) ||
					button.classList.contains("darken-4")
				) {
					button.classList.remove(color)
					button.classList.remove("darken-4")
				}
				button.classList.add("teal", "lighten-5")
				button.style.color = "#26a69a"
			})
		})
	}
}

materialColorful.onclick = () => {
	currentTheme = 0
	let isChecked = document.getElementById("switch-dark").checked
	if (isChecked) {
		navBar.style.backgroundColor = "rgba(55, 71, 79, 0.6)"
		document.body.style.background = "rgb(51, 68, 85)"
		document.body.style.color = "rgb(216, 237, 255)"

		COLORS.forEach((color) => {
			for (let i = 0; i < NAV_BUTTONS.length; i++) {
				if (
					NAV_BUTTONS[i].classList.contains(color) ||
					NAV_BUTTONS[i].classList.contains("lighten-5") ||
					NAV_BUTTONS[i].classList.contains("darken-4")
				) {
					NAV_BUTTONS[i].classList.remove(color)
					NAV_BUTTONS[i].classList.remove("lighten-5")
					NAV_BUTTONS[i].classList.remove("darken-4")
				}
				NAV_BUTTONS[0].classList.add("blue")
				NAV_BUTTONS[1].classList.add("green")
				NAV_BUTTONS[2].classList.add("red")
				NAV_BUTTONS[3].classList.add("purple")
				NAV_BUTTONS[4].classList.add("indigo")
				NAV_BUTTONS[5].classList.add("orange")
				NAV_BUTTONS[6].classList.add("pink")
			}

			ICONS.forEach((icon) => {
				icon.removeAttribute("style")
			})

			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("blue")

			for (let i = 0; i < SOCIAL_BUTTONS.length; i++) {
				if (
					SOCIAL_BUTTONS[i].classList.contains(color) ||
					SOCIAL_BUTTONS[i].classList.contains("lighten-5")
				) {
					SOCIAL_BUTTONS[i].classList.remove(color)
					SOCIAL_BUTTONS[i].classList.remove("lighten-5")
					SOCIAL_BUTTONS[i].style.color = "white"
				}
				SOCIAL_BUTTONS[0].classList.add("blue")
				SOCIAL_BUTTONS[1].classList.add("red")
				SOCIAL_BUTTONS[2].classList.add("green")
				SOCIAL_BUTTONS[3].classList.add("orange")
			}

			for (let i = 0; i < CARDS.length; i++) {
				if (CARDS[i].classList.contains(color)) {
					CARDS[i].classList.remove(color)
					CARDS[i].removeAttribute("style")
				}
				CARDS[0].classList.add("blue", "darken-2")
				CARDS[1].classList.add("red", "darken-2")
				CARDS[2].classList.add("green", "darken-2")
			}
		})
	} else {
		navBar.style.backgroundColor = "rgba(55, 71, 79, 0.6)"
		navBar.style.backdropFilter = "blur(5px)"
		document.body.style.backgroundImage =
			"linear-gradient(to left, rgb(216, 237, 255), #90a4ae)"

		COLORS.forEach((color) => {
			for (let i = 0; i < NAV_BUTTONS.length; i++) {
				if (
					NAV_BUTTONS[i].classList.contains(color) ||
					NAV_BUTTONS[i].classList.contains("lighten-5") ||
					NAV_BUTTONS[i].classList.contains("darken-4")
				) {
					NAV_BUTTONS[i].classList.remove(color)
					NAV_BUTTONS[i].classList.remove("lighten-5")
					NAV_BUTTONS[i].classList.remove("darken-4")
				}
				NAV_BUTTONS[0].classList.add("blue")
				NAV_BUTTONS[1].classList.add("green")
				NAV_BUTTONS[2].classList.add("red")
				NAV_BUTTONS[3].classList.add("purple")
				NAV_BUTTONS[4].classList.add("indigo")
				NAV_BUTTONS[5].classList.add("orange")
				NAV_BUTTONS[6].classList.add("pink")
			}

			ICONS.forEach((icon) => {
				icon.removeAttribute("style")
			})

			if (footer.classList.contains(color)) {
				footer.classList.remove(color)
			}
			footer.classList.add("blue")

			for (let i = 0; i < SOCIAL_BUTTONS.length; i++) {
				if (
					SOCIAL_BUTTONS[i].classList.contains(color) ||
					SOCIAL_BUTTONS[i].classList.contains("lighten-5") ||
					SOCIAL_BUTTONS[i].classList.contains("darken-4")
				) {
					SOCIAL_BUTTONS[i].classList.remove(color)
					SOCIAL_BUTTONS[i].classList.remove("lighten-5")
					SOCIAL_BUTTONS[i].classList.remove("darken-4")
					SOCIAL_BUTTONS[i].style.color = "white"
				}
				SOCIAL_BUTTONS[0].classList.add("blue")
				SOCIAL_BUTTONS[1].classList.add("red")
				SOCIAL_BUTTONS[2].classList.add("green")
				SOCIAL_BUTTONS[3].classList.add("orange")
			}

			for (let i = 0; i < CARDS.length; i++) {
				if (CARDS[i].classList.contains(color)) {
					CARDS[i].classList.remove(color)
					CARDS[i].removeAttribute("style")
				}
				CARDS[0].classList.add("blue", "darken-2")
				CARDS[1].classList.add("red", "darken-2")
				CARDS[2].classList.add("green", "darken-2")
			}
		})
	}
}

// dark mode

const switchDark = () => {
	if (currentTheme === 0) materialColorful.click()
	if (currentTheme === 1) materialBlue.click()
	if (currentTheme === 2) materialGreen.click()
	if (currentTheme === 3) materialRed.click()
	if (currentTheme === 4) materialYellow.click()
	if (currentTheme === 5) materialPurple.click()
	if (currentTheme === 6) materialTeal.click()
}

// work for removing jquery

const dropdown = document.querySelector(".dropdown-trigger")
const modal = document.querySelectorAll(".modal")
const formSelect = document.querySelectorAll("select")
const tooltip = document.querySelectorAll(".tooltipped")
const floatingActionButton = document.querySelector(".fixed-action-btn")
const sideNav = document.querySelector(".sidenav")
const carousel = document.querySelector(".carousel")

// Don't change the order of the following elements
const instanceActions = [
	dropdown,
	modal,
	formSelect,
	tooltip,
	floatingActionButton,
	sideNav,
	carousel,
]

for (let i = 0; i < instanceActions.length; i++) {
	M.Dropdown.init(instanceActions[0])
	M.Modal.init(instanceActions[1])
	M.FormSelect.init(instanceActions[2])
	M.Tooltip.init(instanceActions[3])
	M.FloatingActionButton.init(instanceActions[4])
	M.Sidenav.init(instanceActions[5])

	const carouselInstance = M.Carousel.init(instanceActions[6])
	setInterval(() => {
		carouselInstance.next()
	}, 1500)
}

// preloader done
const preloader = document.querySelector(".pre-loader")
function fadeOut() {
	const fadeEffect = setInterval(function () {
		if (!preloader.style.opacity) {
			preloader.style.opacity = 1
		}
		if (preloader.style.opacity > 0) {
			preloader.style.opacity -= 0.1
		} else {
			clearInterval(fadeEffect)
			preloader.style.display = "none"
		}
	}, 100)
}
setInterval(() => {
	fadeOut()
}, 2000)
