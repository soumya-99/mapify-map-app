// for the maze
let windowSize = 800
let cellSize = 4
let n = windowSize / cellSize // maze dimensions. So maze is currently 10x10
let vertices = n * n // number of vertices
let grid = new Array() //the maze
let colorWhite = "rgba(255,255,255,1)" // strings of white and black colours
let colorBlack = "rgba(0,0,0,1)"

// for algorithm
let adj = new Array() // this is the first layer
// second layer is creatd locally
let pred = new Array(vertices).fill(-1) // predecessor
let path = new Array(vertices).fill(0) // path
//initially
let source = 0
let des = 99

function preload() {
	// change your map image here
	mapImg = loadImage("maps/map2.png")
}

// this function is called only once when loding
function setup() {
	//frameRate(60)
	createCanvas(windowSize, windowSize)
	init()
}

// this function is called in every frame
function draw() {
	background(220)
	fill(160, 160, 160)

	// drawing maze
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j].isWall === true) fill(32, 32, 32)
			else if (grid[i][j].isPath === true) fill(255, 0, 0)
			else if (grid[i][j].vertexNumber === source || grid[i][j].isSourceMarked === true) fill(0, 255, 0)
			else if (grid[i][j].vertexNumber === des || grid[i][j].isDestMarked === true) fill(0, 0, 255)
			else fill(160, 160, 160)
			rect(grid[i][j].y, grid[i][j].x, cellSize, cellSize)
		}
	}
}
////////////////////////////////////////////////////////////////////

// this is my cell calss. Represents each cell in the grid.
// each cell is a vertex
class Cell {
	constructor(isWall, isVisited, vertexNumber, x, y) {
		this.isWall = isWall
		this.isVisited = isVisited
		this.isPath = false // if it is in the final path. False initially
		this.isSourceMarked = false // if soruce or dest
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

	for (let i = 0; i < n; i++) {
		arr = [] // clear
		for (let j = 0; j < n; j++) {
			let tempOb = new Cell(false, false, count, j * cellSize, i * cellSize) // j in x as going row-wise
			let halfSize = cellSize / 2
			let pixelX = i * cellSize + halfSize
			let pixelY = j * cellSize + halfSize
			let pixelColor = mapImg.get(pixelX, pixelY)
			let colour = color(pixelColor).toString()
			if (colour === colorBlack) // basically make it wall
				tempOb.isWall = true

			arr.push(tempOb)
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
			if (mouseX > posX && mouseX < posX + 12 &&
				mouseY > posY && mouseY < posY + 12) {
				if (keyIsDown(83)) { // if "S" is pressed
					source = grid[i][j].vertexNumber
					grid[i][j].isSourceMarked = true;
				} else if (keyIsDown(68)) { // if "D" is pressed
					des = grid[i][j].vertexNumber
					grid[i][j].isDestMarked = true;
				}
			}
		}
	}

	//clear paths and source and destination marks
	if(keyCode === 82) {	//if 'R' is pressed then clear 
		clearPath()
	}

	// toggling for bfs algorithm
	if (keyCode === 13) {
		// if "Enter" is pressed then create data structrue and run bfs on it.
		adj = new Array()
		pred = new Array(vertices).fill(-1)
		path = new Array(vertices).fill(0)
		createStructure()
		bfs()
		let length = getPath()

		// now setting toggling the isPath to make them highlight
		for (let k = 0; k < length; k++)
			for (let i = 0; i < n; i++)
				for (let j = 0; j < n; j++)
					if (grid[i][j].vertexNumber === path[k]) 
						grid[i][j].isPath = true
	}
}

// the parts for implementing algorithm
function createStructure() {
	// this creates the actual internal adjacent list like structure
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			let temp = new Array()

			if (grid[i][j].isWall === false) {
				if (j + 1 < n && grid[i][j + 1].isWall === false)
					temp.push(grid[i][j + 1].vertexNumber)
				if (j - 1 > 0 && grid[i][j - 1].isWall === false)
					temp.push(grid[i][j - 1].vertexNumber)
				if (i + 1 < n && grid[i + 1][j].isWall === false)
					temp.push(grid[i + 1][j].vertexNumber)
				if (i - 1 > 0 && grid[i - 1][j].isWall === false)
					temp.push(grid[i - 1][j].vertexNumber)
			}

			adj.push(temp)
		}
	}
}

// bfs algorithm
function bfs() {
	let visited = new Array(vertices).fill(false)
	let queue = new Array()

	visited[source] = true
	queue.push(source)

	while (queue.length > 0) {
		let x = queue.shift() // already popped front
		if (x === des) {
			pred[source] = -1
			return
		}

		// accessing the first array element with random access, here adj[x].
		// it's reference arrays are accessed sequentially. here adj[x][i] in loop
		for (let i = 0; i < adj[x].length; i++) {
			let vNum = adj[x][i]
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
	let i = des
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
		for (let j = 0; j < grid[i].length; j++){
			grid[i][j].isPath = false
			grid[i][j].isSourceMarked = false
			grid[i][j].isDestMarked = false
		}
			
}