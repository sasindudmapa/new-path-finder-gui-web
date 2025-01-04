let map_nodes = []

const mapCanvas = document.getElementById("map")

let cursorX;
let cursorY; 

let nodeSize = window.innerHeight * 0.1;

let nodeCreateState = true

mapCanvas.addEventListener("mousemove", (e) => {
  cursorX = e.pageX;
  cursorY = e.pageY;
});



mapCanvas.addEventListener("click", createNewNode)

function createNewNode(){
    const newNode = document.createElement("div")
    newNode.style.left = `${cursorX - nodeSize/4}px`
    newNode.style.top = `${cursorY - nodeSize/4}px`
    newNode.id = "node"
    console.log(newNode)

    mapCanvas.appendChild(newNode)
}


function createNewEdge(){
    console.log("creating new edge")
}

document.addEventListener("keydown", (e) => {
    if(e.key == "e"){
        if(nodeCreateState){
            //remove create node listener
            mapCanvas.removeEventListener("click", createNewNode)
            //add create edge listener
            mapCanvas.addEventListener("click", createNewEdge)
        }else{
            //remove create edge listener
            mapCanvas.removeEventListener("click", createNewEdge)
            mapCanvas.addEventListener("click", createNewNode)
        }
        nodeCreateState = !nodeCreateState
    }
});



function pathFinder(start, goal, map_nodes) {
    let visitedNodeList = [[start, null]];
    let unvisitedSortedNodesList = [[null, Infinity, null]]; // [node number, cost, previous node]

    const goalCords = map_nodes[goal - 1][1]; 
    const startCords = map_nodes[start - 1][1];

    let gradient = 0;
    let intercept = 0;

    let currentNode = start;
    let foundGoal = false;

    // Calculate the gradient and intercept of the line from start to goal
    function createStartToGoalLine() {
        const [startX, startY] = startCords;
        const [goalX, goalY] = goalCords;

        gradient = (goalY - startY) / (goalX - startX);
        intercept = startY - gradient * startX;
    }

    // Calculate the cost of a node
    function costOfNode(calNodeNum, goalCords, disToCalNode, gradient, intercept) {
        const [calX, calY] = map_nodes[calNodeNum - 1][1];
        const [goalX, goalY] = goalCords;

        const dSqrd = Math.pow(gradient * calX - calY + intercept, 2) / (Math.pow(gradient, 2) + 1);
        const tSqrd = Math.pow(calX - goalX, 2) + Math.pow(calY - goalY, 2);

        return disToCalNode + dSqrd + tSqrd;
    }

    // Sort and add the current node's neighbors to the sorted nodes list
    function neighboursCostCal(curNode) {
        const curNodeNeighbours = map_nodes[curNode - 1][2]; // [ [neighbor number, cost], [..], ... ]

        for (let neighbour of curNodeNeighbours) {
            if (neighbour[0] === goal) {
                foundGoal = true;
                break;
            }

            // Check if the neighbor has already been calculated and has more than one neighbor
            if (!map_nodes[neighbour[0] - 1][map_nodes[neighbour[0] - 1].length - 1] && map_nodes[neighbour[0] - 1][2].length > 1) {
                const cost = costOfNode(neighbour[0], goalCords, neighbour[1], gradient, intercept);

                map_nodes[neighbour[0] - 1][map_nodes[neighbour[0] - 1].length - 1] = true;

                for (let index = 0; index < unvisitedSortedNodesList.length; index++) {
                    if (cost <= unvisitedSortedNodesList[index][1]) {
                        unvisitedSortedNodesList.splice(index, 0, [neighbour[0], cost, currentNode]);
                        break;
                    }
                }
            }
        }
    }

    // Visit the next node
    function handleNextNodeVisit() {
        const minNode = unvisitedSortedNodesList[0]; // [nodeNum, cost, prevNode]

        // Update visited nodes list
        if (visitedNodeList.length >= minNode[0]) {
            visitedNodeList[minNode[0] - 1] = [minNode[0], minNode[2]];
        } else {
            while (visitedNodeList.length < minNode[0] - 1) {
                visitedNodeList.push(null);
            }
            visitedNodeList.push([minNode[0], minNode[2]]);
        }

        // Set current node to the minimum node of the sorted nodes list
        currentNode = minNode[0];

        // Remove current node from the sorted nodes list
        unvisitedSortedNodesList.shift();
    }

    createStartToGoalLine();

    map_nodes[start - 1][map_nodes[start - 1].length - 1] = true;

    while (!foundGoal) {
        neighboursCostCal(currentNode);

        if (!foundGoal) {
            handleNextNodeVisit();
        }
    }

    let foundPath = [goal];
    let makingPath = true;
    let nodeInserting = currentNode; // At this state, nodeInserting = final node before goal

    // Add the final node before the goal node to the found path list
    foundPath.unshift(nodeInserting);

    while (makingPath) {
        if (foundPath[0] !== start) {
            foundPath.unshift(visitedNodeList[nodeInserting - 1][1]);
            nodeInserting = visitedNodeList[nodeInserting - 1][1];
        } else {
            makingPath = false;
        }
    }

    console.log(foundPath);
}

// Example usage:
// Assume map_nodes is defined elsewhere
// pathFinder(19, 2, map_nodes);
