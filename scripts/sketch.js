// for the maze
const WINDOWSIZE_X = 800
const WINDOWSIZE_Y = 800

const CELLSIZE = 4
const MAX_X = WINDOWSIZE_X / CELLSIZE
const MAX_Y = WINDOWSIZE_Y / CELLSIZE
const VERTICES = MAX_X * MAX_Y

let grid = new Array() //the maze
let colorWhite = "rgba(255,255,255,1)" // strings of white colour

// for algorithm
let adj = new Map()
// second layer is creatd locally
let pred = new Array(VERTICES).fill(-1) // predecessor
let path = new Array(VERTICES).fill(0) // path
//initially
let source = 0
let destination = 99

function preload() {
	// change your map image here
	mapImg = loadImage("maps/map4.png")
}

// this function is called only once when loding
function setup() {
	//frameRate(60)
	createCanvas(WINDOWSIZE_X, WINDOWSIZE_Y)
	init()
	createAdjacencyMap()
}

// this function is called in every frame
function draw() {
	background(55, 71, 79)
	noStroke()
	fill(160, 160, 0)

	// drawing maze
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j].isPath === true) fill(255, 0, 0)
			else if (grid[i][j].isSourceMarked === true) fill(0, 255, 0)
			else if (grid[i][j].isDestMarked === true) fill(0, 0, 255)
			else fill(255, 255, 255)
			rect(grid[i][j].y, grid[i][j].x, CELLSIZE, CELLSIZE)
		}
	}
}
////////////////////////////////////////////////////////////////////

// this is my cell calss. Represents each cell in the grid.
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

	for (let i = 0; i < MAX_X; i++) {
		arr = [] // clear
		for (let j = 0; j < MAX_Y; j++) {
			let halfSize = CELLSIZE / 2
			let pixelX = i * CELLSIZE + halfSize
			let pixelY = j * CELLSIZE + halfSize
			let pixelColor = mapImg.get(pixelX, pixelY)
			let colour = color(pixelColor).toString()
			if (colour === colorWhite) {
				// basically make it wall
				let tempOb = new Cell(count, j * CELLSIZE, i * CELLSIZE)
				arr.push(tempOb)
			}

			count = count + 1
		}
		grid.push(arr)
	}
}

// this function will be called each time mouse is pressed
function mousePressed() {
	//don't need to add walls anymore
}

// this function will be called each time keyboard key is pressed
function keyPressed() {
	// toggling for source and destination
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			let posX = grid[i][j].y
			let posY = grid[i][j].x
			if (
				mouseX > posX &&
				mouseX < posX + 12 &&
				mouseY > posY &&
				mouseY < posY + 12
			) {
				if (keyIsDown(83)) {
					// if "S" is pressed
					source = grid[i][j].vertexNumber
					grid[i][j].isSourceMarked = true
				} else if (keyIsDown(68)) {
					// if "D" is pressed
					destination = grid[i][j].vertexNumber
					grid[i][j].isDestMarked = true
				}
			}
		}
	}

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
}

const findPath = () => {
	// adj = new Array()
	pred = new Array(VERTICES).fill(-1)
	path = new Array(VERTICES).fill(0)
	createAdjacencyMap()
	bfs()
	let length = getPath()

	// now setting toggling the isPath to make them highlight
	for (let k = 0; k < length; k++)
		for (let i = 0; i < grid.length; i++)
			for (let j = 0; j < grid[i].length; j++)
				if (grid[i][j].vertexNumber === path[k]) grid[i][j].isPath = true
}

// the parts for implementing algorithm
function createAdjacencyMap() {
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
		for (let k = 0; k < curr.length; k++) {
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
	for (let i = 0; i < grid.length; i++)
		for (let j = 0; j < grid[i].length; j++) {
			grid[i][j].isPath = false
			grid[i][j].isSourceMarked = false
			grid[i][j].isDestMarked = false
		}
}
