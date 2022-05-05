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

const box_dimensions = 2
let maxX = canvas.width / box_dimensions //image loading needs to be done before this
let maxY = canvas.height / box_dimensions //cause accessing the canvas element here
let vertex = maxX * maxY //maximum possible number of veritces
const cellSize = 6
let pred = new Array(vertex).fill(-1) // predecessor
let pathFound = false

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

	let boxJ = Math.trunc(mx / box_dimensions)
	let boxI = Math.trunc(my / box_dimensions)
	//calculating curr vertex number logically where the mouse pointer is
	let hotCell = Math.trunc(boxI * maxX + boxJ)

	if (destSet === false && destButtonOn === true) {
		destination = hotCell
		// colorImagePixels(mx, my, cellSize, 0, 255, 0)
		destSet = true
		destButtonOn = false
		return
	}
	if (sourceSet === false && srcButtonOn === true) {
		source = hotCell
		// colorImagePixels(mx, my, cellSize, 0, 0, 255)
		sourceSet = true
		srcButtonOn = false
		return
	}
}

//the bfs function kind of works the same way...
function bfs() {
	let visited = new Array(vertex).fill(false)
	let queue = new Array()

	visited[source] = true
	queue.push(source)

	//for execution time checking
	let startTime = performance.now()

	while (queue.length > 0) {
		let x = queue.shift() // already popped front
		if (x === destination) {
			pathFound = true
			pred[source] = -1
			return //if reached the destination
		}

		x = Math.trunc(x)
		let currItem = x
		let i = Math.trunc(currItem / maxX)
		let j = Math.trunc(currItem - i * maxX)
		let halfSize = box_dimensions / 2
		let boxPixlX = j * box_dimensions + halfSize
		let boxPixlY = i * box_dimensions + halfSize
		let queueTemp = new Array()

		///now determine n8 adjacents of x
		//up
		let upPixlX = boxPixlX
		let upPixlY = boxPixlY - box_dimensions
		if (upPixlY > 0) {
			if (compareColorValues(upPixlX, upPixlY)) {
				let item = currItem - maxX
				queueTemp.push(item)
			}
		}
		//left
		let leftPixX = boxPixlX - box_dimensions
		let leftPixY = boxPixlY
		if (leftPixX > 0) {
			if (compareColorValues(leftPixX, leftPixY)) {
				let item = currItem - 1
				queueTemp.push(item)
			}
		}
		//right
		let rightPixX = boxPixlX + box_dimensions
		let rightPixY = boxPixlY
		if (rightPixX < canvas.width) {
			if (compareColorValues(rightPixX, rightPixY)) {
				let item = currItem + 1
				queueTemp.push(item)
			}
		}
		//bottom
		let bottomPixX = boxPixlX
		let bottomPixY = boxPixlY + box_dimensions
		if (bottomPixY < canvas.height) {
			if (compareColorValues(bottomPixX, bottomPixY)) {
				let item = currItem + maxX
				queueTemp.push(item)
			}
		}

		//top left
		let topleftPixX = boxPixlX - box_dimensions
		let topleftPixY = boxPixlY - box_dimensions
		if (topleftPixX > 0 && topleftPixY > 0) {
			if (compareColorValues(topleftPixX, topleftPixY)) {
				let item = currItem - maxX - 1
				queueTemp.push(item)
			}
		}
		//top right
		let toprightPixX = boxPixlX + box_dimensions
		let toprightPixY = boxPixlY - box_dimensions
		if (toprightPixX < canvas.width && toprightPixY > 0) {
			if (compareColorValues(toprightPixX, toprightPixY)) {
				let item = currItem - maxX + 1
				queueTemp.push(item)
			}
		}
		//bottom left
		let bottomleftPixX = boxPixlX - box_dimensions
		let bottomleftPixY = boxPixlY + box_dimensions
		if (bottomleftPixX > 0 && bottomleftPixY < canvas.height) {
			if (compareColorValues(bottomleftPixX, bottomleftPixY)) {
				let item = currItem + maxX - 1
				queueTemp.push(item)
			}
		}
		//bottom right
		let bottomrightPixX = boxPixlX + box_dimensions
		let bottomrightPixY = boxPixlY + box_dimensions
		if (bottomrightPixX < canvas.width && bottomrightPixY < canvas.height) {
			if (compareColorValues(bottomrightPixX, bottomrightPixY)) {
				let item = currItem + maxX + 1
				queueTemp.push(item)
			}
		}

		//now all the adjacents of x are in queueTemp and can be used
		//as an alternative of any supporting data structure for bfs.
		for (let k = 0; k < queueTemp.length; k++) {
			let vNum = queueTemp[k]
			if (visited[vNum] === false) {
				visited[vNum] = true
				queue.push(vNum)
				pred[vNum] = x
			}
		}
		//console.log(queue.length)

		let endTime = performance.now()
		if (endTime - startTime > 10000) {
			//I don't know mannnnn
			//seeming sus lately
			console.log("Error..forcing return")
			M.toast({ html: "Error..forcing return", classes: "rounded" })
			return
		}
	}
	pathFound = false
	//console.log("returning from bfs")
	M.toast({ html: "Path Not Found!", classes: "rounded" })
}

function highLightPath() {
	let temp = destination
	while (pred[temp] !== -1) {
		let currCell = temp
		let i = Math.trunc(currCell / maxX)
		let j = Math.trunc(currCell - i * maxX)
		let x = j * box_dimensions + box_dimensions / 2
		let y = i * box_dimensions + box_dimensions / 2
		colorImagePixels(x, y, 1, 255, 0, 0)
		temp = pred[temp]
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
}

resetButton.onclick = () => {
	let img = document.getElementById("map-image")
	let newImage = document.getElementById("mapSelect")
	img.src = newImage.value
	img.onload = () => {
		context.drawImage(img, 0, 0, img.width, img.height)
	}
	resetStates()
}

function resetStates() {
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
	bfs()
	if (pathFound) highLightPath()
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

//utility functions
//created a colored box to the given coordinate with given boxSize and rgb values
function colorImagePixels(x, y, size, colorR, colorG, colorB) {
	let xLow = x - size
	let xHigh = x + size
	let yLow = y - size
	let yHigh = y + size

	for (let i = xLow; i <= xHigh; i++) {
		for (let j = yLow; j <= yHigh; j++) {
			pixel = context.getImageData(i, j, 1, 1)
			pixel.data[0] = colorR
			pixel.data[1] = colorG
			pixel.data[2] = colorB
			context.putImageData(pixel, i, j)
		}
	}
}

//to compare two color values
function compareColorValues(x, y) {
	pixel = context.getImageData(x, y, 1, 1)
	if (pixel.data[0] >= 250 && pixel.data[1] >= 250 && pixel.data[2] >= 250)
		return true
	else return false
}

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

materialBlue.onclick = (e) => {
	navBar.style.backgroundColor = "rgba(30, 136, 229, 0.6)"
	navBar.style.backdropFilter = "blur(5px)"
	document.body.style.backgroundImage =
		"linear-gradient(to left, #e3f2fd, #90caf9)"

	COLORS.forEach((color) => {
		if (footer.classList.contains(color) || footer.classList.contains("blue")) {
			footer.classList.remove("blue")
			footer.classList.remove(color)
		}
		footer.classList.add("blue")

		if (floatingButton.classList.contains(color)) {
			floatingButton.classList.remove(color)
		}
		floatingButton.classList.add("blue")

		NAV_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
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
			card.style.backgroundColor = "#001946"
			card.style.color = "#d8e2ff"
		})

		SOCIAL_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
			}
			button.classList.add("blue", "lighten-5")
			button.style.color = "dodgerblue"
		})
	})
}

materialGreen.onclick = (e) => {
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
				button.classList.contains("lighten-5")
			) {
				button.classList.remove(color)
				button.classList.remove("lighten-5")
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
			card.style.backgroundColor = "#00210c"
			card.style.color = "#87faad"
		})

		SOCIAL_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
			}
			button.classList.add("green", "lighten-5")
			button.style.color = "forestgreen"
		})
	})
}

materialRed.onclick = (e) => {
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
				button.classList.contains("lighten-5")
			) {
				button.classList.remove(color)
				button.classList.remove("lighten-5")
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
			card.style.backgroundColor = "#400010"
			card.style.color = "#ffdade"
		})

		SOCIAL_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
			}
			button.classList.add("red", "lighten-5")
			button.style.color = "#f44336"
		})
	})
}

materialYellow.onclick = (e) => {
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
				button.classList.contains("lighten-5")
			) {
				button.classList.remove(color)
				button.classList.remove("lighten-5")
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
			card.style.backgroundColor = "#390c00"
			card.style.color = "#ffdbce"
		})

		SOCIAL_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
			}
			button.classList.add("orange", "lighten-5")
			button.style.color = "orange"
		})
	})
}

materialPurple.onclick = (e) => {
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
				button.classList.contains("lighten-5")
			) {
				button.classList.remove(color)
				button.classList.remove("lighten-5")
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
			card.style.backgroundColor = "#2f004c"
			card.style.color = "#f6d9ff"
		})

		SOCIAL_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
			}
			button.classList.add("purple", "lighten-5")
			button.style.color = "#ab47bc"
		})
	})
}

materialTeal.onclick = (e) => {
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
				button.classList.contains("lighten-5")
			) {
				button.classList.remove(color)
				button.classList.remove("lighten-5")
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
			card.style.backgroundColor = "#011f22"
			card.style.color = "#7cf4ff"
		})

		SOCIAL_BUTTONS.forEach((button) => {
			if (button.classList.contains(color)) {
				button.classList.remove(color)
			}
			button.classList.add("teal", "lighten-5")
			button.style.color = "#26a69a"
		})
	})
}

materialColorful.onclick = () => {
	navBar.style.backgroundColor = "rgba(55, 71, 79, 0.6)"
	navBar.style.backdropFilter = "blur(5px)"
	document.body.style.backgroundImage =
		"linear-gradient(to left, rgb(216, 237, 255), #90a4ae)"

	COLORS.forEach((color) => {
		for (let i = 0; i < NAV_BUTTONS.length; i++) {
			if (
				NAV_BUTTONS[i].classList.contains(color) ||
				NAV_BUTTONS[i].classList.contains("lighten-5")
			) {
				NAV_BUTTONS[i].classList.remove(color)
				NAV_BUTTONS[i].classList.remove("lighten-5")
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
			}
			CARDS[0].classList.add("blue", "darken-2")
			CARDS[1].classList.add("red", "darken-2")
			CARDS[2].classList.add("green", "darken-2")
		}
	})
}
