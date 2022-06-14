//these all are required now
//made them global to preseve states within function calls
let predFromSource = new Map()
let predFromDest = new Map()
let sourceQueue = new Array()
let destQueue = new Array()
let sourceVisited = new Array(vertex).fill(false)
let destVisited = new Array(vertex).fill(false)
let universalPaths = new Array() //universal path
//not resets until reset button or swap map pressed
let pathColor
let copyOfWaypoints = new Array()

function bfsManager(source, destination, waypoints) {
	let BfsSource = source
	let BfsDestination = destination
	let interMediatePoints = new Array()
	interMediatePoints.push(...waypoints)
	copyOfWaypoints = interMediatePoints
	pathColor = materialYouPathColor

	if (interMediatePoints.length === 0) {
		//if there's no intermediate points
		BfsSingleRun(BfsSource, BfsDestination)
		return
	}

	//for the first iteration
	let currentSource = BfsSource
	let currDestination = interMediatePoints[0]
	BfsSingleRun(currentSource, currDestination)
	//for all way points
	for (let i = 1; i < interMediatePoints.length; i++) {
		//run bfs until all waypoints are visited
		//manage source and dest for each way points
		currentSource = currDestination
		currDestination = interMediatePoints[i]
		resetBfsManagerStates()
		BfsSingleRun(currentSource, currDestination)
	}
	//for last iteration
	currentSource = currDestination
	currDestination = BfsDestination
	resetBfsManagerStates()
	BfsSingleRun(currentSource, currDestination)
}

function BfsSingleRun(currentSource, currDestination) {
	sourceVisited[currentSource] = true
	sourceQueue.push(currentSource)

	destVisited[currDestination] = true
	destQueue.push(currDestination)

	let sourceBfsFlag = -1,
		destBfsFlag = -1
	while (sourceBfsFlag === -1 && destBfsFlag === -1) {
		sourceBfsFlag = sourceBfs()
		destBfsFlag = destBfs()
	}

	let currentPath = getPath(sourceBfsFlag, destBfsFlag)
	if (currentPath.length === 0)
		M.toast({ html: "No path exists in between", classes: "rounded" })
	else {
		universalPaths.push(...currentPath)
		highLightPath()
	}
}

function sourceBfs() {
	if (sourceQueue.length === 0) return 0

	let x = sourceQueue.shift() // already popped front
	x = Math.trunc(x)
	let coords = findCoordinateOfVertex(x)
	let boxPixlX = coords[0]
	let boxPixlY = coords[1]
	let queueTemp = getN8Adjacents(x, boxPixlX, boxPixlY)

	//now all the adjacents of x are in queueTemp and can be used
	//as an alternative of any supporting data structure for bfs.
	for (let k = 0; k < queueTemp.length; k++) {
		let vNum = queueTemp[k]
		if (sourceVisited[vNum] === false) {
			sourceVisited[vNum] = true
			sourceQueue.push(vNum)
			predFromSource.set(vNum, x)
			if (predFromDest.has(vNum) === true) return vNum
		}
	}
	return -1
}

function destBfs() {
	if (destQueue.length === 0) return 0

	let x = destQueue.shift() // already popped front
	x = Math.trunc(x)
	let coords = findCoordinateOfVertex(x)
	let boxPixlX = coords[0]
	let boxPixlY = coords[1]
	let queueTemp = getN8Adjacents(x, boxPixlX, boxPixlY)

	//now all the adjacents of x are in queueTemp and can be used
	//as an alternative of any supporting data structure for bfs.
	for (let k = 0; k < queueTemp.length; k++) {
		let vNum = queueTemp[k]
		if (destVisited[vNum] === false) {
			destVisited[vNum] = true
			destQueue.push(vNum)
			predFromDest.set(vNum, x)
			if (predFromSource.has(vNum) === true) return vNum
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
		if (compareColorValues(upPixlX, upPixlY, pathColor)) {
			queueTemp.push(currItem - maxX)
		}
	}
	//left
	let leftPixX = boxPixlX - box_dimensions
	let leftPixY = boxPixlY
	if (leftPixX > 0) {
		if (compareColorValues(leftPixX, leftPixY, pathColor)) {
			queueTemp.push(currItem - 1)
		}
	}
	//right
	let rightPixX = boxPixlX + box_dimensions
	let rightPixY = boxPixlY
	if (rightPixX < canvas.width) {
		if (compareColorValues(rightPixX, rightPixY, pathColor)) {
			queueTemp.push(currItem + 1)
		}
	}
	//bottom
	let bottomPixX = boxPixlX
	let bottomPixY = boxPixlY + box_dimensions
	if (bottomPixY < canvas.height) {
		if (compareColorValues(bottomPixX, bottomPixY, pathColor)) {
			queueTemp.push(currItem + maxX)
		}
	}

	//top left
	let topleftPixX = boxPixlX - box_dimensions
	let topleftPixY = boxPixlY - box_dimensions
	if (topleftPixX > 0 && topleftPixY > 0) {
		if (compareColorValues(topleftPixX, topleftPixY, pathColor)) {
			queueTemp.push(currItem - maxX - 1)
		}
	}
	//top right
	let toprightPixX = boxPixlX + box_dimensions
	let toprightPixY = boxPixlY - box_dimensions
	if (toprightPixX < canvas.width && toprightPixY > 0) {
		if (compareColorValues(toprightPixX, toprightPixY, pathColor)) {
			queueTemp.push(currItem - maxX + 1)
		}
	}
	//bottom left
	let bottomleftPixX = boxPixlX - box_dimensions
	let bottomleftPixY = boxPixlY + box_dimensions
	if (bottomleftPixX > 0 && bottomleftPixY < canvas.height) {
		if (compareColorValues(bottomleftPixX, bottomleftPixY, pathColor)) {
			queueTemp.push(currItem + maxX - 1)
		}
	}
	//bottom right
	let bottomrightPixX = boxPixlX + box_dimensions
	let bottomrightPixY = boxPixlY + box_dimensions
	if (bottomrightPixX < canvas.width && bottomrightPixY < canvas.height) {
		if (compareColorValues(bottomrightPixX, bottomrightPixY, pathColor)) {
			queueTemp.push(currItem + maxX + 1)
		}
	}
	return queueTemp
}

function getPath(sourceFlag, destFlag) {
	let temp = new Array()

	let index = sourceFlag > destFlag ? sourceFlag : destFlag
	while (predFromSource.has(index) === true) {
		let curr = predFromSource.get(index)
		temp.push(curr)
		index = curr
	}

	index = sourceFlag > destFlag ? sourceFlag : destFlag
	while (predFromDest.has(index) === true) {
		let curr = predFromDest.get(index)
		temp.push(curr)
		index = curr
	}
	return temp
}

// path size
const pathSizeElement = document.getElementById("path-size")
const badgePathSize = document.getElementById("badge-pathSize")

let pathSize = 1
pathSizeElement.value = pathSize
badgePathSize.innerHTML = pathSize

pathSizeElement.addEventListener("input", (e) => {
	pathSize = e.target.value
	badgePathSize.innerHTML = pathSize
	redrawPath()	//reloads the image and redraws the path with new pathsize
})

function redrawPath() {
	if(isReset == true)
		return 	//not the condition for redrawing

	//clear the image and then in onload redraw the src and dest
	let img = document.getElementById("map-image")
	let tempCustomImage = document.getElementById("map-image")
	let newImage = document.getElementById("mapSelect")
	if (customInputEnabled === true) {
		tempCustomImage.src = customImageInput.src
		canvas.width = customImageInput.width
		canvas.height = customImageInput.height
		tempCustomImage.onload = () => {
			context.drawImage(tempCustomImage, 0, 0, customImageInput.width, customImageInput.height)
			highLightPath()
			reDrawSrcDest()
			reDrawStops()
		}
	}
	else {
		img.src = newImage.value
		canvas.width = img.width
		canvas.height = img.height
		img.onload = () => {
			context.drawImage(img, 0, 0, img.width, img.height)
			highLightPath()
			reDrawSrcDest()
			reDrawStops()
		}
	}
}

function reDrawSrcDest() {
	let srcCoord = findCoordinateOfVertex(source)
	let destCoord = findCoordinateOfVertex(destination)
	colorImagePixels(srcCoord[0], srcCoord[1], 6, 0, 0, 255)
	colorImagePixels(destCoord[0], destCoord[1], 6, 0, 255, 0)
}

function reDrawStops() {
	for(let i=0;i<copyOfWaypoints.length;i++) {
		wayPointCoord = findCoordinateOfVertex(copyOfWaypoints[i])
		colorImagePixels(wayPointCoord[0], wayPointCoord[1], 6, 255, 0, 0)
	}
}

function highLightPath() {
	let pathColor = materialYouPathColor
	const pathWidth = parseInt(pathSize)
	for (let p = 0; p < universalPaths.length; p++) {
		let coords = findCoordinateOfVertex(universalPaths[p])
		colorImagePixels(
			coords[0],
			coords[1],
			pathWidth,
			hexToRgb(pathColor).r,
			hexToRgb(pathColor).g,
			hexToRgb(pathColor).b
		)
	}
}

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

// custom color
const newColor = document.getElementById("custom-color")
let red = hexToRgb(newColor.value).r
let green = hexToRgb(newColor.value).g
let blue = hexToRgb(newColor.value).b
const settingsIcon = document.getElementById("settings-icon")

newColor.addEventListener("input", (e) => {
	newColor.value = e.target.value
	red = hexToRgb(e.target.value).r
	green = hexToRgb(e.target.value).g
	blue = hexToRgb(e.target.value).b
	settingsIcon.style.color = e.target.value
})

function saveSettings() {
	//console.log("save", red, green, blue)
}

function resetDefault() {
	if (confirm("Are you sure? All your changes will be lost.")) {
		newColor.value = "#fafafa"
		red = hexToRgb(newColor.value).r
		green = hexToRgb(newColor.value).g
		blue = hexToRgb(newColor.value).b
		settingsIcon.style.color = newColor.value

		pathSize = 1
		pathSizeElement.value = pathSize
		badgePathSize.innerText = pathSize

		sensitivity = 5
		sensitivityRange.value = sensitivity
		badgeSensitivity.innerText = sensitivity

		M.toast({ html: "Settings reset to default", classes: "green rounded" })
	} else {
		M.toast({ html: "Your settings are safe.", classes: "blue rounded" })
	}
}

// sensitivity
let sensitivity = 5
const sensitivityRange = document.getElementById("sensitivity")
const badgeSensitivity = document.getElementById("badge-sensitivity")
sensitivityRange.value = sensitivity
badgeSensitivity.innerText = sensitivity

sensitivityRange.addEventListener("input", (e) => {
	sensitivity = e.target.value
	badgeSensitivity.innerText = sensitivity
})

//to compare two color values
function compareColorValues(x, y, currentPathColor) {
	pixel = context.getImageData(x, y, 1, 1)
	if (
		pixel.data[0] >= red - sensitivity &&
		pixel.data[0] <= red + sensitivity &&
		pixel.data[1] >= green - sensitivity &&
		pixel.data[1] <= green + sensitivity &&
		pixel.data[2] >= blue - sensitivity &&
		pixel.data[2] <= blue + sensitivity
	)
		return true
	//support to ignore previously drawn paths
	else if (
		pixel.data[0] === hexToRgb(currentPathColor).r &&
		pixel.data[1] === hexToRgb(currentPathColor).g &&
		pixel.data[2] === hexToRgb(currentPathColor).b
	)
		return true
	//support for pure blue and pure green for source and dest markers
	else if (pixel.data[0] == 0 && pixel.data[1] >= 250 && pixel.data[2] == 0)
		return true
	else if (pixel.data[0] == 0 && pixel.data[1] == 0 && pixel.data[2] >= 250)
		return true
	//support for pure red for stop markers
	else if (pixel.data[0] >= 255 && pixel.data[1] == 0 && pixel.data[2] == 0)
		return true
	else return false
}

//find the logical vertex number from the coordinates
function findVertexAtCoordinate(x, y) {
	let boxJ = Math.trunc(x / box_dimensions)
	let boxI = Math.trunc(y / box_dimensions)
	let hotCell = Math.trunc(boxI * maxX + boxJ)
	return hotCell
}

//find the coordinates from the logical vertex number
function findCoordinateOfVertex(vertexNumber) {
	let currCell = vertexNumber
	let i = Math.trunc(currCell / maxX)
	let j = Math.trunc(currCell - i * maxX)
	let x = j * box_dimensions + box_dimensions / 2
	let y = i * box_dimensions + box_dimensions / 2
	return [x, y]
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null
}

function resetBfsManagerStates() {
	predFromSource.clear()
	predFromDest.clear()
	sourceQueue = new Array()
	destQueue = new Array()
	sourceVisited = new Array(vertex).fill(false)
	destVisited = new Array(vertex).fill(false)
}
