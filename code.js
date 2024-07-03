const fs = require('fs');
const path = require('path');

// Function to print the grid
function printGrid(grid, maxX, maxY) {
    for (let y = 0; y <= maxY; y++) {
        let row = '';
        for (let x = 0; x <= maxX; x++) {
            row += (grid[`${x},${y}`] || ' ') + ' ';
        }
        console.log(row);
    }
}

// Function to check connectivity
function isConnected(fromCell, toCell, direction, pipeConnections) {
    if ((fromCell === '*' || /[A-Z]/.test(fromCell)) && pipeConnections[toCell]) {
        return pipeConnections[toCell].some(([dx, dy]) => dx === -direction[0] && dy === -direction[1]);
    }
    if ((toCell === '*' || /[A-Z]/.test(toCell)) && pipeConnections[fromCell]) {
        return pipeConnections[fromCell].some(([dx, dy]) => dx === direction[0] && dy === direction[1]);
    }
    if ((fromCell === '*' || /[A-Z]/.test(fromCell)) && (toCell === '*' || /[A-Z]/.test(toCell))) {
        return true;
    }
    if (pipeConnections[fromCell] && pipeConnections[toCell]) {
        return pipeConnections[fromCell].some(([dx, dy]) => dx === direction[0] && dy === direction[1]) &&
               pipeConnections[toCell].some(([dx, dy]) => dx === -direction[0] && dy === -direction[1]);
    }
    return false;
}

// Main function to find connected sinks
function findConnectedSinks(filePath, printGridFlag = false) {
    const data = fs.readFileSync(path.resolve(filePath), 'utf-8');
    const lines = data.trim().split('\n');

    // Determine the maximum x and y coordinates
    const xCoords = lines.map(line => parseInt(line.split(' ')[1]));
    const yCoords = lines.map(line => parseInt(line.split(' ')[2]));
    const maxX = Math.max(...xCoords);
    const maxY = Math.max(...yCoords);

    // Initialize the grid and objects dictionary
    const grid = {};
    const sinks = new Set();
    let source = null;

    // Parse each line to fill the grid, reversing the y-coordinates
    lines.forEach(line => {
        const [obj, xStr, yStr] = line.split(' ');
        const x = parseInt(xStr);
        const y = parseInt(yStr);
        const reversedY = maxY - y;  // Reverse the y-coordinate
        grid[`${x},${reversedY}`] = obj;
        if (obj === '*') {
            source = [x, reversedY];
        } else if (/[A-Z]/.test(obj)) {
            sinks.add(`${x},${reversedY}`);
        }
    });

    // Directions for moving in the grid (right, left, down, up)
    const directions = [
        [1, 0],  // right
        [-1, 0], // left
        [0, 1],  // down
        [0, -1]  // up
    ];

    // Pipe connections
    const pipeConnections = {
        '═': [[1, 0], [-1, 0]],
        '║': [[0, 1], [0, -1]],
        '╔': [[1, 0], [0, 1]],
        '╗': [[-1, 0], [0, 1]],
        '╚': [[-1, 0], [0, 1]],
        '╝': [[-1, 0], [0, -1]],
        '╠': [[0, -1], [0, 1], [1, 0]],
        '╣': [[0, -1], [0, 1], [-1, 0]],
        '╦': [[-1, 0], [1, 0], [0, 1]],
        '╩': [[-1, 0], [1, 0], [0, -1]]
    };

    // BFS to find all connected sinks
    const visited = new Set();
    const queue = [source];
    const connectedSinks = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        const currentKey = `${current[0]},${current[1]}`;
        visited.add(currentKey);

        if (sinks.has(currentKey)) {
            connectedSinks.add(currentKey);
        }

        for (const direction of directions) {
            const nextCell = [current[0] + direction[0], current[1] + direction[1]];
            const nextKey = `${nextCell[0]},${nextCell[1]}`;
            if (grid[nextKey] && !visited.has(nextKey)) { // << inconsistent fixed
                const currentPipe = grid[currentKey];
                const nextPipe = grid[nextKey];

                if (isConnected(currentPipe, nextPipe, direction, pipeConnections)) {
                    queue.push(nextCell);
                }
            }
        }
    }

    // Extract sink labels and sort them alphabetically
    const connectedSinkLabels = Array.from(connectedSinks).map(key => grid[key]).sort().join('');
    return connectedSinkLabels;
}

// Example usage
const filePath = 'connected_sinks.txt';  // Replace with the actual path to your input file
const connectedSinks = findConnectedSinks(filePath, true);
console.log(`connectedSinks = ${connectedSinks}`);