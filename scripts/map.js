// buttons
const srcButton = document.getElementById("source")
const destButton = document.getElementById("dest")
const showPathButton = document.getElementById("sp")
const resetButton = document.getElementById("reset")
const help = document.getElementById("help")
const aboutUs = document.getElementById("aboutus")
const fullScreenButton = document.getElementById("fullscreen")
const downloadButton = document.getElementById("download")

// image related
let img = document.getElementById("map-image")

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
let waypoints = new Array() //array for multiple stops or way points

let materialYouPathColor = "ff0000"

const box_dimensions = 2
let maxX = canvas.width / box_dimensions //image loading needs to be done before this
let maxY = canvas.height / box_dimensions //cause accessing the canvas element here
let vertex = maxX * maxY //maximum possible number of veritces

window.onload = () => {
	context.drawImage(img, 0, 0, img.width, img.height)
	localStorage.dark === "true"
		? document.getElementById("switch-dark").click()
		: switchTheme()
}

//this is called everytime mouse is clicked
function pick(event) {
	var rect = canvas.getBoundingClientRect() // get the canvas' bounding rectangle
	let mx = event.clientX - rect.left // get the mouse's x coordinate
	let my = event.clientY - rect.top // get the mouse's y coordinate
	if (compareColorValues(mx, my, materialYouPathColor) === false) {
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

	if (sourceSet && destSet) {
		colorImagePixels(mx, my, 6, 255, 0, 0)
		waypoints.push(hotCell)
	}
}

//////////////////////////////////

function swapMap() {
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
	universalPaths = new Array() //universalPaths is to be cleared separately for swap map button
}

resetButton.onclick = () => {
	let img = document.getElementById("map-image")
	let newImage = document.getElementById("mapSelect")
	img.src = newImage.value
	img.onload = () => {
		context.drawImage(img, 0, 0, img.width, img.height)
	}
	resetStates()
	universalPaths = new Array() //universalPaths is to be cleared separately for reset button
}

function resetStates() {
	predFromSource.clear()
	predFromDest.clear()
	sourceQueue = new Array()
	destQueue = new Array()
	sourceVisited = new Array(vertex).fill(false)
	destVisited = new Array(vertex).fill(false)
	waypoints = new Array()

	sourceSet = false
	destSet = false
	srcButtonOn = false
	destButtonOn = false
	pathFound = false
	srcButton.classList.remove("disabled")
	destButton.classList.remove("disabled")
}

//methods for buttons
function show_path(event) {
	bfsManager(source, destination, waypoints) //all methods combined
	if (pathFound) highLightPath()
	resetStates() //need to reset after every bfs call
	//we can't reset universalPath here as it will clear previous paths
	//inturn removing the feature of multiple path and theming of multiple paths
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

// for theatre mode
const zoomButton = document.getElementById("zoom")
const zoomIcon = document.getElementById("zoom-icon")
const bodyRight = document.getElementById("body-right")
const bodyLeft = document.getElementById("body-left")
const mapContainer = document.getElementById("map-container")

let isZoomOn = true
zoomButton.onclick = () => {
	if (isZoomOn === true) {
		bodyLeft.style.flexGrow = 1
		bodyLeft.style.transition = "0.8s ease-in-out"
		mapContainer.style.width = "90vw"
		bodyRight.style.display = "none"
		zoomIcon.innerText = "zoom_out"
		isZoomOn = false
	} else {
		bodyLeft.removeAttribute("style")
		bodyRight.removeAttribute("style")
		mapContainer.removeAttribute("style")
		zoomIcon.innerText = "zoom_in"
		isZoomOn = true
	}
}

canvas.addEventListener(
	"click",
	(event) => {
		pick(event)

		if (srcButtonOn || destButtonOn) {
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
	"amber",
]
const NAV_BUTTONS = [
	srcButton,
	destButton,
	showPathButton,
	resetButton,
	help,
	fullScreenButton,
	zoomButton,
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
	zoomIcon,
	downloadIcon,
]

materialBlue.onclick = (e) => {
	localStorage.setItem("theme", 1)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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
					icon.style.color = "#1e90ff"
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
				button.style.color = "#1e90ff"
			})
		})
	}
	//manually set the color for path
	materialYouPathColor = "#1e90ff"
	highLightPath()
}

materialGreen.onclick = (e) => {
	localStorage.setItem("theme", 2)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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
				icon.style.color = "#228B22"
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
				button.style.color = "#228B22"
			})
		})
	}

	//manually set the color for path
	materialYouPathColor = "#228B22"
	highLightPath()
}

materialRed.onclick = (e) => {
	localStorage.setItem("theme", 3)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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

	//manually set the color for path
	materialYouPathColor = "#f44336"
	highLightPath()
}

materialYellow.onclick = (e) => {
	localStorage.setItem("theme", 4)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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
	//manually set the color for path
	materialYouPathColor = "#ffa500" //for orange
	highLightPath()
}

materialPurple.onclick = (e) => {
	localStorage.setItem("theme", 5)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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

	//manually set the color for path
	materialYouPathColor = "#ab47bc"
	highLightPath()
}

materialTeal.onclick = (e) => {
	localStorage.setItem("theme", 6)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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

	//manually set the color for path
	materialYouPathColor = "#26a69a"
	highLightPath()
}

materialColorful.onclick = () => {
	localStorage.setItem("theme", 0)
	let isChecked = document.getElementById("switch-dark").checked
	localStorage.setItem("dark", isChecked)
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
				NAV_BUTTONS[3].classList.add("orange")
				NAV_BUTTONS[4].classList.add("pink")
				NAV_BUTTONS[5].classList.add("amber")
				NAV_BUTTONS[6].classList.add("purple")
				NAV_BUTTONS[7].classList.add("indigo")
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
				NAV_BUTTONS[6].classList.add("amber")
				NAV_BUTTONS[7].classList.add("pink")
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
	//manually set path color
	materialYouPathColor = "ff0000"
	highLightPath()
}

// dark mode

const switchTheme = () => {
	localStorage.theme === "0" && materialColorful.click()
	localStorage.theme === "1" && materialBlue.click()
	localStorage.theme === "2" && materialGreen.click()
	localStorage.theme === "3" && materialRed.click()
	localStorage.theme === "4" && materialYellow.click()
	localStorage.theme === "5" && materialPurple.click()
	localStorage.theme === "6" && materialTeal.click()
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
setTimeout(() => {
	fadeOut()
}, 2000)
