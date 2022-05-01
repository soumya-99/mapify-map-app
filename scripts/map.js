// buttons
let srcButton = document.getElementById("source")
let destButton = document.getElementById("dest")
let showPathButton = document.getElementById("sp")
let resetButton = document.getElementById("reset")
let downloadButton = document.getElementById("download")

// image related
let img = document.getElementById("map-image")

// set up the canvas
let canvas = document.getElementById("canvas")
canvas.width = img.width
canvas.height = img.height
let context = canvas.getContext("2d")

// algo related
let sourceSet = true,
	destSet = true
let source, destination
const box_dimensions = 2
let maxX = canvas.width / box_dimensions //image loading needs to be done before this
let maxY = canvas.height / box_dimensions //cause accessing the canvas element here
let vertex = maxX * maxY //maximum possible number of veritces
const cellSize = 6
let pred = new Array(vertex).fill(-1) // predecessor
let path = new Array(vertex).fill(0) // path

img.onload = async () => {
	await context.drawImage(
		img,
		0,
		0,
		img.width,
		img.height,
		0,
		0,
		canvas.width,
		canvas.height
	)
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

	if (destSet === false) {
		destination = hotCell
		//colorImagePixels(mx, my, cellSize, 0, 255, 0)
		destSet = true
		return
	}
	if (sourceSet === false) {
		source = hotCell
		//colorImagePixels(mx, my, cellSize, 0, 0, 255)
		sourceSet = true
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
			let vNum = queueTemp[k];
			if (visited[vNum] === false) {
				visited[vNum] = true
				queue.push(vNum)
				pred[vNum] = x
			}
		}

		let endTime = performance.now()
		if(endTime-startTime > 10000){
			//soo if it's stuck then
			console.log("f**k I'm out...")
			return
		}
	}
}

function getPath() {
	//creats path array using predecessor array
	let k = 0
	let i = destination
	while (pred[i] !== -1) {
		path[k] = i
		k = k + 1
		i = pred[i]
	}
	path[k] = i
	k = k + 1
	return k
}

function highLightPath() {
	let length = getPath()

	if (length < 2) M.toast({ html: "Path Not Found!", classes: "rounded" })
	//directly change the image colors to show path
	for (let k = 0; k < length; k++) {
		let currCell = path[k]
		let i = Math.trunc(currCell / maxX)
		let j = Math.trunc(currCell - i * maxX)
		let x = j * box_dimensions + box_dimensions / 2
		let y = i * box_dimensions + box_dimensions / 2

		colorImagePixels(x, y, 1, 255, 0, 0)
	}
}

//////////////////////////////////

function swapMap() {
	// let img = document.getElementById("map-image")
	let newImage = document.getElementById("mapSelect")
	img.src = newImage.value
	canvas.width = img.width	//f**king cursed lines 
	canvas.height = img.height	//f**k offfffffffff	//not sure that they are really cursed...
	maxX = canvas.width / box_dimensions
	maxY = canvas.height / box_dimensions
	vertex = maxX * maxY
	img.onload = async () => {
		await context.drawImage(
			img,
			0,
			0,
			img.width,
			img.height,
			0,
			0,
			canvas.width,
			canvas.height
		)
	}
}

function show_path(event) {
	bfs()
	highLightPath()
}

destButton.onclick = (e) => {
	destSet = false
	destButton.classList.add("disabled")
	srcButton.classList.add("disabled")
}

srcButton.onclick = (e) => {
	sourceSet = false
	srcButton.classList.add("disabled")
	destButton.classList.add("disabled")
}

canvas.addEventListener("click", (event) => {
	pick(event)
	srcButton.classList.remove("disabled")
	if (destSet) {
		destButton.classList.remove("disabled")
		srcButton.classList.remove("disabled")
	}
})

showPathButton.onclick = (event) => {
	show_path(event)
}

resetButton.onclick = () => {
	let img = document.getElementById("map-image")
	let newImage = document.getElementById("mapSelect")
	img.src = newImage.value
	img.onload = async () => {
		await context.drawImage(
			img,
			0,
			0,
			img.width,
			img.height,
			0,
			0,
			canvas.width,
			canvas.height
		)
	}
}

downloadButton.onclick = () => {
	downloadButton.download = img.src
	downloadButton.href = canvas.toDataURL()
}

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
