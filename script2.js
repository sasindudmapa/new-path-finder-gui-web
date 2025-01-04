let map_nodes = []; // Stores information about all nodes
let noOfNodes = 0; // Tracks the number of nodes

const mapCanvas = document.getElementById("mapCanvas"); // Canvas for creating nodes
const edgeCanvas = document.getElementById("edgeCanvas"); // Canvas for drawing edges

let cursorX; // Tracks the X-coordinate of the mouse relative to the canvas
let cursorY; // Tracks the Y-coordinate of the mouse relative to the canvas

let nodeSize = 20; // Size of each node

let nodeCreateState = true; // Determines whether the system is in node creation mode
let drawingEdge = false; // Tracks whether an edge is being drawn
let drawingEdgeStartCords = []; // Starting coordinates of the edge
let drawingEdgeEndCords = []; // Ending coordinates of the edge
let drawingEdgeStartNode = null; // Start node for the edge
let drawingEdgeEndNode = null; // End node for the edge
let currentHoveringNode = null; // Currently hovered node

// Track mouse coordinates relative to the canvas
mapCanvas.addEventListener("mousemove", (e) => {
    cursorX = e.pageX - mapCanvas.offsetLeft;
    cursorY = e.pageY - mapCanvas.offsetTop;
});

// Create a new node when the canvas is clicked
mapCanvas.addEventListener("click", createNewNode);

function createNewNode() {
    // Create a new node element
    const newNode = document.createElement("div");
    let newNodePosX = cursorX - nodeSize / 4;
    let newNodePosY = cursorY - nodeSize / 4;

    noOfNodes++;
    let newNodeData = [noOfNodes, [newNodePosX, newNodePosY], [], false]; // Node data: [ID, position, edges, visited flag]
    map_nodes.push(newNodeData);

    // Add the new node to the canvas
    newNode.style.left = `${newNodePosX}px`;
    newNode.style.top = `${newNodePosY}px`;
    newNode.classList.add("node");
    newNode.id = `${noOfNodes}`;
    mapCanvas.appendChild(newNode);

    // Track the currently hovered node
    newNode.addEventListener("mouseover", () => {
        currentHoveringNode = newNode.id;
    });

    // Handle node click for edge creation
    newNode.addEventListener("click", (e) => {
        if (!nodeCreateState) {
            createNewEdge(e.target.id, e.target.getBoundingClientRect());
        }
    });
}

function createNewEdge(nodeId, nodePos) {
    if (drawingEdge) {
        // Set the end coordinates and node for the edge
        drawingEdgeEndCords = [nodePos.x, nodePos.y];
        drawingEdgeEndNode = nodeId;

        // Calculate the distance between the start and end nodes
        let d = Math.sqrt(
            Math.pow(drawingEdgeStartCords[0] - drawingEdgeEndCords[0], 2) +
            Math.pow(drawingEdgeStartCords[1] - drawingEdgeEndCords[1], 2)
        );

        // Update node adjacency lists with the edge and its length
        map_nodes[drawingEdgeStartNode - 1][2].push([parseInt(drawingEdgeEndNode, 10), d]);
        map_nodes[drawingEdgeEndNode - 1][2].push([parseInt(drawingEdgeStartNode, 10), d]);

        // Draw the edge on the edge canvas
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", drawingEdgeStartCords[0]);
        line.setAttribute("y1", drawingEdgeStartCords[1]);
        line.setAttribute("x2", drawingEdgeEndCords[0]);
        line.setAttribute("y2", drawingEdgeEndCords[1]);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "2");
        edgeCanvas.appendChild(line);
    } else {
        // Set the start coordinates and node for the edge
        drawingEdgeStartCords = [nodePos.x, nodePos.y];
        drawingEdgeStartNode = nodeId;
    }

    // Toggle the edge drawing state
    drawingEdge = !drawingEdge;
}

// Toggle between node creation and edge creation modes using the 'e' key
document.addEventListener("keydown", (e) => {
    if (e.key === "e") {
        if (nodeCreateState) {
            // Remove node creation event listener
            mapCanvas.removeEventListener("click", createNewNode);
        } else {
            // Add node creation event listener and remove edge creation
            mapCanvas.removeEventListener("click", createNewEdge);
            mapCanvas.addEventListener("click", createNewNode);
        }
        nodeCreateState = !nodeCreateState;
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


document.addEventListener("keydown", (e)=>{

    if(e.key == "s"){ 
        console.log(map_nodes)
        pathFinder(1, 15, map_nodes)
    }
})