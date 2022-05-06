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
let sourceSet = false, destSet = false
let srcButtonOn = false, destButtonOn = false	//state of buttons
let source, destination

const box_dimensions = 2
let maxX = canvas.width / box_dimensions //image loading needs to be done before this
let maxY = canvas.height / box_dimensions //cause accessing the canvas element here
let vertex = maxX * maxY //maximum possible number of veritces
const cellSize = 6

//these all are required now
//made them global to preseve states within function calls
let predFromSource = new Map()
let predFromDest = new Map()
let sourceQueue = new Array()
let destQueue = new Array()
let sourceVisited = new Array(vertex).fill(false)
let destVisited = new Array(vertex).fill(false)


img.onload = async () => {
	await context.drawImage(
		img,
		0,
		0,
		img.width,
		img.height,
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

	if (destSet === false && destButtonOn === true) {
		destination = hotCell
		//colorImagePixels(mx, my, cellSize, 0, 255, 0)
		destSet = true
		destButtonOn = false
		return
	}
	if (sourceSet === false && srcButtonOn === true) {
		source = hotCell
		//colorImagePixels(mx, my, cellSize, 0, 0, 255)
		sourceSet = true
		srcButtonOn = false
		return
	}
}


function bfsManager() {
	sourceVisited[source] = true
	sourceQueue.push(source)

	destVisited[destination] = true
	destQueue.push(destination)

	let sourceBfsFlag = -1, destBfsFlag = -1
	while(sourceBfsFlag === -1 && destBfsFlag === -1){
		sourceBfsFlag = sourceBfs()
		destBfsFlag = destBfs()
	}

	let path = getPath(sourceBfsFlag, destBfsFlag)
	if(path.length === 0)
		M.toast({ html: "No path exists in between", classes: "rounded" })
	else
		highLightPath(path)
}

function sourceBfs() {
	if (sourceQueue.length === 0)
		return 0

	let x = sourceQueue.shift() // already popped front

	x = Math.trunc(x)
	let currItem = x
	let i = Math.trunc(currItem / maxX)
	let j = Math.trunc(currItem - i * maxX)
	let halfSize = box_dimensions / 2
	let boxPixlX = j * box_dimensions + halfSize
	let boxPixlY = i * box_dimensions + halfSize
	let queueTemp = getN8Adjacents(currItem, boxPixlX, boxPixlY)

	//now all the adjacents of x are in queueTemp and can be used 
	//as an alternative of any supporting data structure for bfs.
	for (let k = 0; k < queueTemp.length; k++) {
		let vNum = queueTemp[k];
		if (sourceVisited[vNum] === false) {
			sourceVisited[vNum] = true
			sourceQueue.push(vNum)
			predFromSource.set(vNum, x)
			if (predFromDest.has(vNum) === true)
				return vNum
		}
	}
	return -1
}


function destBfs() {
	if (destQueue.length === 0)
		return 0

	let x = destQueue.shift() // already popped front

	x = Math.trunc(x)
	let currItem = x
	let i = Math.trunc(currItem / maxX)
	let j = Math.trunc(currItem - i * maxX)
	let halfSize = box_dimensions / 2
	let boxPixlX = j * box_dimensions + halfSize
	let boxPixlY = i * box_dimensions + halfSize
	let queueTemp = getN8Adjacents(currItem, boxPixlX, boxPixlY)

	//now all the adjacents of x are in queueTemp and can be used 
	//as an alternative of any supporting data structure for bfs.
	for (let k = 0; k < queueTemp.length; k++) {
		let vNum = queueTemp[k];
		if (destVisited[vNum] === false) {
			destVisited[vNum] = true
			destQueue.push(vNum)
			predFromDest.set(vNum, x)
			if(predFromSource.has(vNum) === true)
				return vNum
		}
	}
	return -1
}

function getN8Adjacents(currItem, boxPixlX, boxPixlY) {
	let queueTemp = new Array()
	///now determine n8 adjacents of x
	//up
	let upPixlX = boxPixlX
	let upPixlY = boxPixlY - box_dimensions
	if (upPixlY > 0) {
		if (compareColorValues(upPixlX, upPixlY)) {
			queueTemp.push(currItem - maxX)
		}
	}
	//left
	let leftPixX = boxPixlX - box_dimensions
	let leftPixY = boxPixlY
	if (leftPixX > 0) {
		if (compareColorValues(leftPixX, leftPixY)) {
			queueTemp.push(currItem - 1)
		}
	}
	//right
	let rightPixX = boxPixlX + box_dimensions
	let rightPixY = boxPixlY
	if (rightPixX < canvas.width) {
		if (compareColorValues(rightPixX, rightPixY)) {
			queueTemp.push(currItem + 1)
		}
	}
	//bottom
	let bottomPixX = boxPixlX
	let bottomPixY = boxPixlY + box_dimensions
	if (bottomPixY < canvas.height) {
		if (compareColorValues(bottomPixX, bottomPixY)) {
			queueTemp.push(currItem + maxX)
		}
	}

	//top left
	let topleftPixX = boxPixlX - box_dimensions
	let topleftPixY = boxPixlY - box_dimensions
	if (topleftPixX > 0 && topleftPixY > 0) {
		if (compareColorValues(topleftPixX, topleftPixY)) {
			queueTemp.push(currItem - maxX - 1)
		}
	}
	//top right
	let toprightPixX = boxPixlX + box_dimensions
	let toprightPixY = boxPixlY - box_dimensions
	if (toprightPixX < canvas.width && toprightPixY > 0) {
		if (compareColorValues(toprightPixX, toprightPixY)) {
			queueTemp.push(currItem - maxX + 1)
		}
	}
	//bottom left
	let bottomleftPixX = boxPixlX - box_dimensions
	let bottomleftPixY = boxPixlY + box_dimensions
	if (bottomleftPixX > 0 && bottomleftPixY < canvas.height) {
		if (compareColorValues(bottomleftPixX, bottomleftPixY)) {
			queueTemp.push(currItem + maxX - 1)
		}
	}
	//bottom right
	let bottomrightPixX = boxPixlX + box_dimensions
	let bottomrightPixY = boxPixlY + box_dimensions
	if (bottomrightPixX < canvas.width && bottomrightPixY < canvas.height) {
		if (compareColorValues(bottomrightPixX, bottomrightPixY)) {
			queueTemp.push(currItem + maxX + 1)
		}
	}

	return queueTemp
}

function getPath(sourceFlag, destFlag) {
	let path = new Array()
	
	let index = (sourceFlag>destFlag)?sourceFlag:destFlag
	while(predFromSource.has(index) === true) {
		let curr = predFromSource.get(index)
		path.push(curr)
		index = curr
	}

	index = (sourceFlag>destFlag)?sourceFlag:destFlag
	while(predFromDest.has(index) === true) {
		let curr = predFromDest.get(index)
		path.push(curr)
		index = curr
	}

	return path
}

function highLightPath(path) {
	for(let p=0;p<path.length;p++) {
		let currCell = path[p]
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
	canvas.width = img.width
	canvas.height = img.height
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
		)
	}
	resetStates()
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
		)
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
	srcButton.classList.remove("disabled")
	destButton.classList.remove("disabled")
}

//methods for buttons
function show_path(event) {
	bfsManager();	//all methods combined
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
	if (sourceSet && destSet)
		show_path(event)
	else
		M.toast({ html: "Add source and destination first", classes: "rounded" })
}

downloadButton.onclick = () => {
	downloadButton.download = img.src
	downloadButton.href = canvas.toDataURL()
}

canvas.addEventListener("click", (event) => {
	pick(event)

	if (srcButtonOn || destButtonOn) {
		srcButton.classList.add("disabled")
		destButton.classList.add("disabled")
	}
	else {
		srcButton.classList.remove("disabled")
		destButton.classList.remove("disabled")
	}
})


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
