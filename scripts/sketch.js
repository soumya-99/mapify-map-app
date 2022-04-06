// for the maze
let WINDOWSIZE_X = 0
let WINDOWSIZE_Y = 0

const CELLSIZE = 4
let MAX_X = 0
let MAX_Y = 0
let VERTICES = 0

let grid = new Array() //the maze
let colorWhite = "rgba(255,255,255,1)" // strings of white colour
let imageNameArray = [
	"maps/map2.png",
	"maps/map3.png",
	"maps/map4.png",
	"maps/map5.png",
	"maps/map6.png",
]
let lodedImages = [] //holds the loded images
let currentMapIndex = 0 //current image index

// for algorithm
let adj = new Map()
// second layer is creatd locally
let pred = new Array(VERTICES).fill(-1) // predecessor
let path = new Array(VERTICES).fill(0) // path
//initially
let source = 0
let sourceAdded = false
let destination = 99
let destAdded = false

function preload() {
	//load all maps
	imageNameArray.forEach((img) => {
		mapImg = loadImage(img)
		lodedImages.push(mapImg)
	})
	mapImg = lodedImages[currentMapIndex]
}

// this function is called only once when loding
function setup() {
	//create a canvas with the dimension of the image
	image(mapImg, 0, 0)
	WINDOWSIZE_X = mapImg.width
	WINDOWSIZE_Y = mapImg.height
	MAX_X = WINDOWSIZE_X / CELLSIZE
	MAX_Y = WINDOWSIZE_Y / CELLSIZE
	VERTICES = MAX_X * MAX_Y

	createCanvas(WINDOWSIZE_X, WINDOWSIZE_Y)
	init()
	createAdjacencyMap()
}

function reSetup() {
	//load the next image
	if (currentMapIndex === lodedImages.length - 1) currentMapIndex = 0
	else currentMapIndex = currentMapIndex + 1
	mapImg = lodedImages[currentMapIndex]

	//re initialize all the values
	image(mapImg, 0, 0)
	WINDOWSIZE_X = mapImg.width
	WINDOWSIZE_Y = mapImg.height
	MAX_X = WINDOWSIZE_X / CELLSIZE
	MAX_Y = WINDOWSIZE_Y / CELLSIZE
	VERTICES = MAX_X * MAX_Y
	console.log(MAX_X, MAX_Y)

	//resize canvas
	resizeCanvas(WINDOWSIZE_X, WINDOWSIZE_Y)
	init()
	createAdjacencyMap()
}

// this function is called in every frame
function draw() {
	background(55, 71, 79)
	noStroke()
	fill(160, 160, 0)

	// drawing maze
	grid.forEach((row) => {
		row.forEach((cell) => {
			if (cell.isPath === true) fill(255, 0, 0)
			else if (cell.isSourceMarked === true) fill(0, 255, 0)
			else if (cell.isDestMarked === true) fill(0, 0, 255)
			else fill(255, 255, 255)
			rect(cell.y, cell.x, CELLSIZE, CELLSIZE)
		})
	})
}
////////////////////////////////////////////////////////////////////

// this is my Cell class. Represents each cell in the grid.
// each cell is a vertex
class Cell {
	constructor(vertexNumber, x, y) {
		this.isPath = false // if it is in the final path. False initially
		this.isSourceMarked = false // if soruce or destinationt
		this.isDestMarked = false
		this.vertexNumber = vertexNumber
		this.x = x
		this.y = y
	}
}

// init created the maze or grid
function init() {
	let count = 0 // this will be vertex number
	let arr = new Array()
	grid = [] //this needs to be cleared for every reSet() call

	for (let i = 0; i < MAX_Y; i++) {
		arr = [] // clear
		for (let j = 0; j < MAX_X; j++) {
			let halfSize = CELLSIZE / 2
			let pixelX = j * CELLSIZE + halfSize
			let pixelY = i * CELLSIZE + halfSize
			let pixelColor = mapImg.get(pixelX, pixelY)
			let colour = color(pixelColor).toString()
			if (colour === colorWhite) {
				// basically make it wall
				let tempOb = new Cell(count, i * CELLSIZE, j * CELLSIZE)
				arr.push(tempOb)
			}
			count = count + 1
		}
		grid.push(arr)
	}
}

// this function will be called each time keyboard key is pressed
function keyPressed() {
	// toggling for source and destination
	grid.forEach((row) => {
		row.forEach((cell) => {
			if (
				mouseX > cell.y && // posX
				mouseX < cell.y + 12 && // posX
				mouseY > cell.x && // posY
				mouseY < cell.x + 12 //posY
			) {
				if (keyIsDown(83)) {
					// if "S" is pressed
					source = cell.vertexNumber
					cell.isSourceMarked = true
					sourceAdded = true
				} else if (keyIsDown(68)) {
					// if "D" is pressed
					destination = cell.vertexNumber
					cell.isDestMarked = true
					destAdded = true
				}
			}
		})
	})

	//clear paths and source and destination marks
	if (keyCode === 82) {
		//if 'R' is pressed then clear
		clearPath()
	}

	// toggling for bfs algorithm
	if (keyCode === 13) {
		// if "Enter" is pressed then create data structrue and run bfs on it.
		findPath()
	}

	if (keyCode == 81) {
		//if "Q" is pressed then load next map and re-initialize everything
		reSetup()
		clearPath()
	}
}

const findPath = () => {
	if (!sourceAdded || !destAdded) return

	// adj = new Array()
	pred = new Array(VERTICES).fill(-1)
	path = new Array(VERTICES).fill(0)
	//createAdjacencyMap()
	bfs()
	let length = getPath()

	// now setting toggling the isPath to make them highlight
	for (let k = 0; k < length; k++)
		grid.forEach((row) => {
			row.forEach((cell) => {
				if (cell.vertexNumber === path[k]) cell.isPath = true
			})
		})
}

// the parts for implementing algorithm
function createAdjacencyMap() {
	adj.clear()

	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			let temp = new Array()

			//up
			if (i - 1 >= 0) {
				let item = grid[i][j].vertexNumber - MAX_X - 1
				for (let k = 0; k < grid[i - 1].length; k++) {
					// if (gridVector[i - 1][k].vertex > item)
					// 	break;
					if (grid[i - 1][k].vertexNumber === item) {
						temp.push(item)
						break
					}
				}
			}

			//left
			if (j - 1 >= 0) {
				if (grid[i][j - 1].vertexNumber === grid[i][j].vertexNumber - 1)
					temp.push(grid[i][j - 1].vertexNumber)
			}

			//right
			if (j + 1 < grid[i].length) {
				if (grid[i][j + 1].vertexNumber === grid[i][j].vertexNumber + 1)
					temp.push(grid[i][j + 1].vertexNumber)
			}

			//down
			if (i + 1 < grid.length) {
				let item = grid[i][j].vertexNumber + MAX_X + 1
				for (let k = 0; k < grid[i + 1].length; k++) {
					// if (gridVector[i - 1][k].vertex > item)
					// 	break;
					if (grid[i + 1][k].vertexNumber === item) {
						temp.push(item)
						break
					}
				}
			}

			//adj.set(grid[i][j].vertexNumber, temp);
			adj[grid[i][j].vertexNumber] = temp
		}
	}
}

// bfs algorithm
function bfs() {
	let visited = new Array(VERTICES).fill(false)
	let queue = new Array()

	visited[source] = true
	queue.push(source)

	while (queue.length > 0) {
		let x = queue.shift() // already popped front
		if (x === destination) {
			pred[source] = -1
			return
		}

		//in this new approach adjacencyMap is a hash map of integer key and a vector of int as value
		//directly access the vector with the unique key (here x)
		let curr = adj[x]
		curr.forEach((vNum) => {
			if (visited[vNum] === false) {
				visited[vNum] = true
				queue.push(vNum)
				pred[vNum] = x
			}
		})
	}
}

function getPath() {
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

function clearPath() {
	grid.forEach((row) => {
		row.forEach((cell) => {
			cell.isPath = false
			cell.isSourceMarked = false
			cell.isDestMarked = false
		})
	})
	sourceAdded = false
	destAdded = false
}
