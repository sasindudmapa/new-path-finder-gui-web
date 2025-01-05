let map_nodes = [
    [1,[344,222],[["2",207.8677464158401]],true],
    [
        2,
        [
            539,
            150
        ],
        [
            [
                "1",
                207.8677464158401
            ],
            [
                "3",
                137.84411485442533
            ]
        ],
        true
    ],
    [
        3,
        [
            654,
            226
        ],
        [
            [
                "2",
                137.84411485442533
            ]
        ],
        false
    ]
]

let map_wnodes = [
    // Urban Center
    [1, [100, 150], [[2, 50], [3, 70], [4, 80]], false],
    [2, [150, 170], [[1, 50], [3, 60]], false],
    [3, [130, 200], [[1, 70], [2, 60], [4, 40]], false],
    [4, [90, 220], [[1, 80], [3, 40], [5, 300]], false],  // Added connection to 5
    
    // Suburban Area
    [5, [300, 150], [[6, 40], [7, 70], [4, 300]], false],  // Added connection to 4
    [6, [340, 170], [[5, 40], [8, 80]], false],
    [7, [320, 130], [[5, 70], [8, 60]], false],
    [8, [360, 200], [[6, 80], [7, 60], [9, 400]], false],  // Added connection to 9
    
    // Rural Towns
    [9, [700, 300], [[10, 90], [11, 120], [8, 400]], false],  // Added connection to 8
    [10, [750, 350], [[9, 90], [12, 100]], false],
    [11, [720, 270], [[9, 120], [12, 70]], false],
    [12, [760, 250], [[10, 100], [11, 70], [13, 350]], false],  // Added connection to 13
    
    // Coastal Area
    [13, [150, 500], [[14, 60], [15, 100], [12, 350]], false],  // Added connection to 12
    [14, [200, 520], [[13, 60], [16, 80]], false],
    [15, [180, 470], [[13, 100], [16, 70]], false],
    [16, [230, 490], [[14, 80], [15, 70], [17, 500]], false],  // Added connection to 17
    
    // Mountainous Region
    [17, [600, 600], [[18, 80], [19, 90], [16, 500]], false],  // Added connection to 16
    [18, [580, 650], [[17, 80], [20, 110]], false],
    [19, [620, 570], [[17, 90], [20, 100]], false],
    [20, [670, 620], [[18, 110], [19, 100]], false],
]







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
console.log(map_nodes)
pathFinder(19, 2, map_nodes);
