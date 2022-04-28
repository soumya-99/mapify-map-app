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
let adj = new Map() //hash map for storing adjacency data
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
	createAdjMap() //create the hash map form the image after loading the image
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
		colorImagePixels(mx, my, cellSize, 0, 255, 0)
		destSet = true
		return
	}
	if (sourceSet === false) {
		source = hotCell
		colorImagePixels(mx, my, cellSize, 0, 0, 255)
		sourceSet = true
		return
	}
}

////////////////////////
function createAdjMap() {
	let temp = new Array()

	for (let i = 0; i < maxX; i++) {
		for (let j = 0; j < maxY; j++) {
			temp = []
			let currItem = Math.trunc(i * maxX + j) //find current vertexNum with current i and j

			let halfSize = box_dimensions / 2
			let boxPixlX = j * box_dimensions + halfSize //reversed here for indexing purpose
			let boxPixlY = i * box_dimensions + halfSize //getting the center coordinate of the current cell

			if (compareColorValues(boxPixlX, boxPixlY)) {
				//if it is white
				//checking it's n8 adjacncy sequentially
				// topLeft -> up -> topRight -> left -> right -> bottomLeft -> bottom -> bottomUp for adjacent vertices

				//top left
				let topleftPixX = boxPixlX - box_dimensions
				let topleftPixY = boxPixlY - box_dimensions
				if (topleftPixX > 0 && topleftPixY > 0) {
					if (compareColorValues(topleftPixX, topleftPixY)) {
						let item = currItem - maxX - 1
						temp.push(item)
					}
				}
				//up
				let upPixlX = boxPixlX
				let upPixlY = boxPixlY - box_dimensions
				if (upPixlY > 0) {
					if (compareColorValues(upPixlX, upPixlY)) {
						let item = currItem - maxX
						temp.push(item)
					}
				}
				//top right
				let toprightPixX = boxPixlX + box_dimensions
				let toprightPixY = boxPixlY - box_dimensions
				if (toprightPixX < canvas.width && toprightPixY > 0) {
					if (compareColorValues(toprightPixX, toprightPixY)) {
						let item = currItem - maxX + 1
						temp.push(item)
					}
				}

				//left
				let leftPixX = boxPixlX - box_dimensions
				let leftPixY = boxPixlY
				if (leftPixX > 0) {
					if (compareColorValues(leftPixX, leftPixY)) {
						let item = currItem - 1
						temp.push(item)
					}
				}
				//right
				let rightPixX = boxPixlX + box_dimensions
				let rightPixY = boxPixlY
				if (rightPixX < canvas.width) {
					if (compareColorValues(rightPixX, rightPixY)) {
						let item = currItem + 1
						temp.push(item)
					}
				}

				//bottom left
				let bottomleftPixX = boxPixlX - box_dimensions
				let bottomleftPixY = boxPixlY + box_dimensions
				if (bottomleftPixX > 0 && bottomleftPixY < canvas.height) {
					if (compareColorValues(bottomleftPixX, bottomleftPixY)) {
						let item = currItem + maxX - 1
						temp.push(item)
					}
				}
				//bottom
				let bottomPixX = boxPixlX
				let bottomPixY = boxPixlY + box_dimensions
				if (bottomPixY < canvas.height) {
					if (compareColorValues(bottomPixX, bottomPixY)) {
						let item = currItem + maxX
						temp.push(item)
					}
				}
				//bottom right
				let bottomrightPixX = boxPixlX + box_dimensions
				let bottomrightPixY = boxPixlY + box_dimensions
				if (bottomrightPixX < canvas.width && bottomrightPixY < canvas.height) {
					if (compareColorValues(bottomrightPixX, bottomrightPixY)) {
						let item = currItem + maxX + 1
						temp.push(item)
					}
				}

				//insert the array into hash map
				//so hash map contains the 8 adjacent vertices of the current vertexNum or cell
				adj[currItem] = temp
			}
		}
	}
}

//the bfs function kind of works the same way...
function bfs() {
	let visited = new Array(vertex).fill(false)
	let queue = new Array()

	visited[source] = true
	queue.push(source)

	while (queue.length > 0) {
		let x = queue.shift() // already popped front
		if (x === destination) {
			pred[source] = -1
			return //if reached the destination
		}

		//in this approach adjacencyMap is a hash map of integer key and integer array as value
		//directly accessing the value with the unique key (here x)
		x = Math.trunc(x)
		let curr = adj[x]
		for (let k = 0; k < curr.length; k++) {
			//check for their adjacency with current vertex
			let vNum = curr[k]
			if (visited[vNum] === false) {
				visited[vNum] = true
				queue.push(vNum)
				pred[vNum] = x
			}
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
		createAdjMap()
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
	if (pixel.data[0] >= 240 && pixel.data[1] >= 240 && pixel.data[2] >= 240)
		return true
	else return false
}
