
//these all are required now
//made them global to preseve states within function calls
let predFromSource = new Map()
let predFromDest = new Map()
let sourceQueue = new Array()
let destQueue = new Array()
let sourceVisited = new Array(vertex).fill(false)
let destVisited = new Array(vertex).fill(false)
let universalPaths = new Array()    //universal path 
                                    //not resets until reset button or swap map pressed

let BfsSource, BfsDestination
let pathColor

function bfsManager(source, destination) {
    BfsSource = source
    BfsDestination = destination

    sourceVisited[BfsSource] = true
    sourceQueue.push(BfsSource)

    destVisited[BfsDestination] = true
    destQueue.push(BfsDestination)

    let sourceBfsFlag = -1, destBfsFlag = -1
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
    if (sourceQueue.length === 0)
        return 0

    let x = sourceQueue.shift() // already popped front
    x = Math.trunc(x)
    let coords = findCoordinateOfVertex(x)
    let boxPixlX = coords[0]
    let boxPixlY = coords[1]
    let queueTemp = getN8Adjacents(x, boxPixlX, boxPixlY)

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
    let coords = findCoordinateOfVertex(x)
    let boxPixlX = coords[0]
    let boxPixlY = coords[1]
    let queueTemp = getN8Adjacents(x, boxPixlX, boxPixlY)

    //now all the adjacents of x are in queueTemp and can be used 
    //as an alternative of any supporting data structure for bfs.
    for (let k = 0; k < queueTemp.length; k++) {
        let vNum = queueTemp[k];
        if (destVisited[vNum] === false) {
            destVisited[vNum] = true
            destQueue.push(vNum)
            predFromDest.set(vNum, x)
            if (predFromSource.has(vNum) === true)
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
    let temp = new Array()

    let index = (sourceFlag > destFlag) ? sourceFlag : destFlag
    while (predFromSource.has(index) === true) {
        let curr = predFromSource.get(index)
        temp.push(curr)
        index = curr
    }

    index = (sourceFlag > destFlag) ? sourceFlag : destFlag
    while (predFromDest.has(index) === true) {
        let curr = predFromDest.get(index)
        temp.push(curr)
        index = curr
    }
    return temp
}

function highLightPath() {
    pathColor = materialYouPathColor
    for (let p = 0; p < universalPaths.length; p++) {
        let coords = findCoordinateOfVertex(universalPaths[p])
        colorImagePixels(coords[0], coords[1], 1, hexToRgb(pathColor).r, hexToRgb(pathColor).g, hexToRgb(pathColor).b)
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

//to compare two color values
function compareColorValues(x, y) {
    pixel = context.getImageData(x, y, 1, 1)
    if (pixel.data[0] >= 250 && pixel.data[1] >= 250 && pixel.data[2] >= 250)
        return true
    //support for pure blue and pure green for source and dest markers
    else if (pixel.data[0] == 0 && pixel.data[1] >= 250 && pixel.data[2] == 0)
        return true
    else if (pixel.data[0] == 0 && pixel.data[1] == 0 && pixel.data[2] >= 250)
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
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}