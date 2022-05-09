let srcPred = new Map()
let destPred = new Map()
let midPred = new Map()

let srcQueue = new Array()
let desQueue = new Array()
let midQueue = new Array()

let srcVisited = new Array(vertex).fill(false)
let decVisited = new Array(vertex).fill(false)
let midVisited = new Array(vertex).fill(false)


let sourceBfsFlag = -1, destBfsFlag = -1
let midSrc = -1, midDest = -1, midBfsFlag = -1


function triBfs() {

    srcVisited[source] = true
    srcQueue.push(source)

    midVisited[middle] = true
    midQueue.push(middle)

    decVisited[destination] = true
    desQueue.push(destination)

    while (midSrc === -1 || midDest === -1) {
        if (sourceBfsFlag === -1)
            sourceBfsFlag = sourceBfs()

        midBfsFlag = midBfs()

        if (destBfsFlag === -1)
            destBfsFlag = destBfs()
    }


    let path = getTriPath(sourceBfsFlag, destBfsFlag, midSrc, midDest)
    if (path.length === 0)
        M.toast({ html: "No path exists in between", classes: "rounded" })
    else
        //console.log(path)
        highLightTriPath(path)
}

function sourceBfs() {
    if (srcQueue.length === 0)
        return 0

    let x = srcQueue.shift() // already popped front

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
        if (srcVisited[vNum] === false) {
            srcVisited[vNum] = true
            srcQueue.push(vNum)
            srcPred.set(vNum, x)
            if (midPred.has(vNum) === true)
                return vNum
        }
    }
    return -1
}


function midBfs() {
    if (midQueue.length === 0)
        return 0

    let x = midQueue.shift() // already popped front

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
        if (midVisited[vNum] === false) {
            midVisited[vNum] = true
            midQueue.push(vNum)
            midPred.set(vNum, x)
            if (srcPred.has(vNum) === true && midSrc === -1) {
                midSrc = vNum
                return vNum
            }

            if (destPred.has(vNum) === true && midDest === -1) {
                midDest = vNum
                return vNum
            }
        }
    }
    return -1
}


function destBfs() {
    if (desQueue.length === 0)
        return 0

    let x = desQueue.shift() // already popped front

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
        if (decVisited[vNum] === false) {
            decVisited[vNum] = true
            desQueue.push(vNum)
            destPred.set(vNum, x)
            if (midPred.has(vNum) === true)
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

function getTriPath(sourceBfsFlag, destBfsFlag, midSrc, midDest) {
    let path = new Array()

    let index = midSrc
    while (midPred.has(index) === true) {
        let curr = midPred.get(index)
        path.push(curr)
        index = curr
    }
    index = midDest
    while (midPred.has(index) === true) {
        let curr = midPred.get(index)
        path.push(curr)
        index = curr
    }

    index = sourceBfsFlag
    while (srcPred.has(index) === true) {
        let curr = srcPred.get(index)
        path.push(curr)
        index = curr
    }
    index = destBfsFlag
    while (destPred.has(index) === true) {
        let curr = destPred.get(index)
        path.push(curr)
        index = curr
    }


    // let index = (sourceFlag>destFlag)?sourceFlag:destFlag
    // while(srcPred.has(index) === true) {
    // 	let curr = srcPred.get(index)
    // 	path.push(curr)
    // 	index = curr
    // }

    // index = (sourceFlag>destFlag)?sourceFlag:destFlag
    // while(destPred.has(index) === true) {
    // 	let curr = destPred.get(index)
    // 	path.push(curr)
    // 	index = curr
    // }

    return path
}

function highLightTriPath(path) {
    for (let p = 0; p < path.length; p++) {
        let currCell = path[p]
        let i = Math.trunc(currCell / maxX)
        let j = Math.trunc(currCell - i * maxX)
        let x = j * box_dimensions + box_dimensions / 2
        let y = i * box_dimensions + box_dimensions / 2
        colorImagePixels(x, y, 1, 255, 0, 0)
    }
}

function resetTriStates() {
    srcPred.clear()
    destPred.clear()
    midPred.clear()
    srcQueue = new Array()
    desQueue = new Array()
    midQueue = new Array()
    srcVisited = new Array(vertex).fill(false)
    decVisited = new Array(vertex).fill(false)
    midVisited = new Array(vertex).fill(false)

    sourceBfsFlag = -1
    destBfsFlag = -1
    midSrc = -1
    midDest = -1
    midBfsFlag = -1

    sourceSet = false
    destSet = false
    srcButtonOn = false
    destButtonOn = false
    srcButton.classList.remove("disabled")
    destButton.classList.remove("disabled")
}