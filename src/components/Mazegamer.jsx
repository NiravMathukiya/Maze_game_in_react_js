import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti'; // Import confetti package

const Maze = () => {
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState([1, 1]); // Player's starting position
  const [start, setStart] = useState([1, 1]); // Start point
  const [end, setEnd] = useState([13, 13]); // End point (depends on difficulty)
  const [difficulty, setDifficulty] = useState('easy'); // Default difficulty
  const [mazeSize, setMazeSize] = useState(15); // Default maze size for easy
  const [gameWon, setGameWon] = useState(false); // Track if game is won
  const [footprints, setFootprints] = useState([]); // Array to track player's footsteps
  const [steps, setSteps] = useState(0); // Track player's steps
  const [minSteps, setMinSteps] = useState(null); // Minimum steps required for the maze

  // Update maze size and end position based on difficulty level
  const updateMazeSize = (difficulty) => {
    if (difficulty === 'easy') {
      setMazeSize(10);
      setEnd([8, 8]);
    } else if (difficulty === 'medium') {
      setMazeSize(15);
      setEnd([15, 15]);
    } else if (difficulty === 'hard') {
      setMazeSize(20);
      setEnd([20, 20]);
    } else if (difficulty === 'super-hard') {
      setMazeSize(25);
      setEnd([25, 25]);
    }
  };

  // Recursive Backtracking Maze Generation Algorithm
  const generateMaze = (rows, cols) => {
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(0));

    // Directions: Right, Down, Left, Up
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    const dfs = (x, y) => {
      grid[x][y] = 1; // Mark current cell as part of the path
      shuffle(directions); // Shuffle directions to randomize the maze

      for (let [dx, dy] of directions) {
        const nx = x + dx * 2, ny = y + dy * 2;
        if (nx > 0 && nx < rows && ny > 0 && ny < cols && grid[nx][ny] === 0) {
          grid[x + dx][y + dy] = 1; // Carve a path between current and next cell
          dfs(nx, ny); // Recur for the next cell
        }
      }
    };

    dfs(1, 1); // Start DFS from the top-left corner
    grid[0][1] = 1; // Ensure entrance
    grid[rows - 2][cols - 1] = 1; // Ensure exit

    // Ensure Start and End are open and connected
    grid[1][1] = 1;
    grid[rows - 2][cols - 2] = 1;
    return grid;
  };

  useEffect(() => {
    updateMazeSize(difficulty); // Update maze size based on difficulty
    const generatedMaze = generateMaze(mazeSize, mazeSize);
    setMaze(generatedMaze);
    setPlayerPos([1, 1]); // Reset player position to start
    setGameWon(false); // Reset game won state
    setFootprints([]); // Reset footprints
    setSteps(0); // Reset steps
    calculateMinSteps(generatedMaze); // Calculate minimum steps using BFS
  }, [difficulty, mazeSize]);

  // Function to calculate minimum steps using BFS
  const calculateMinSteps = (maze) => {
    const queue = [[...start, 0]]; // [x, y, distance]
    const visited = Array(mazeSize).fill(null).map(() => Array(mazeSize).fill(false));
    visited[start[0]][start[1]] = true;

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    while (queue.length > 0) {
      const [x, y, dist] = queue.shift();

      // If we reached the end point, return the distance
      if (x === end[0] && y === end[1]) {
        setMinSteps(dist);
        return;
      }

      for (const [dx, dy] of directions) {
        const nx = x + dx, ny = y + dy;
        if (
          nx >= 0 && ny >= 0 && nx < mazeSize && ny < mazeSize &&
          maze[nx][ny] === 1 && !visited[nx][ny]
        ) {
          visited[nx][ny] = true;
          queue.push([nx, ny, dist + 1]);
        }
      }
    }
  };

  // Function to move the player
  const movePlayer = (direction) => {
    const [x, y] = playerPos; // Current player position
    let newX = x, newY = y;

    // Determine new position based on direction
    if (direction === 'ArrowUp' || direction === 'w') newX -= 1;
    if (direction === 'ArrowDown' || direction === 's') newX += 1;
    if (direction === 'ArrowLeft' || direction === 'a') newY -= 1;
    if (direction === 'ArrowRight' || direction === 'd') newY += 1;

    // Check if the new position is within bounds and is a path (1 means path)
    if (
      newX >= 0 &&
      newX < mazeSize &&
      newY >= 0 &&
      newY < mazeSize &&
      maze[newX][newY] === 1
    ) {
      setPlayerPos([newX, newY]);
      setFootprints([...footprints, [newX, newY]]); // Record the player's step

      // Check if the player has reached the end of the maze
      if (newX === end[0] && newY === end[1]) {
        setGameWon(true); // Set game won state to true
      } else {
        setSteps((prevSteps) => prevSteps + 1); // Increment step count only if not won
      }
    }
  };

  // Add event listener to detect key presses for movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      movePlayer(e.key); // Call movePlayer with the pressed key
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPos, maze]);

  // Calculate the remaining distance (dynamic)
  const remainingDistance = Math.abs(end[0] - playerPos[0]) + Math.abs(end[1] - playerPos[1]);

  // Function to close the winning popup
  const closeModal = () => {
    setGameWon(false); // Close the winning modal
    // Reset the game if desired
    setPlayerPos([1, 1]);
    setFootprints([]);
    setSteps(0);
  };

  return (
    <div className="flex flex-col items-center justify-center max-h-screen">
      {/* Difficulty selection */}
      <div className="flex mb-4">
        <label className="text-xl font-bold">Select Difficulty: </label>
        <select
          className="ml-4 px-2 py-1 border rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="super-hard">Super Hard</option>
        </select>
      </div>
      <p className="text-green-800 text-xl">Remaining Distance: {remainingDistance} cells</p>

      {/* Maze grid */}
      <div
        className="grid p-3 place-items-center"
        style={{
          gridTemplateColumns: `repeat(${mazeSize}, 40px)`,
          gridTemplateRows: `repeat(${mazeSize}, 40px)`,
        }}
      >
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Determine className based on the cell type
            let cellClass = "border border-gray-300 w-10 h-10 flex items-center justify-center";
            if (rowIndex === start[0] && colIndex === start[1]) {
              cellClass += " bg-blue-600"; // Start cell
            } else if (rowIndex === end[0] && colIndex === end[1]) {
              cellClass += " bg-red-600"; // End cell
            } else if (rowIndex === playerPos[0] && colIndex === playerPos[1]) {
              cellClass += " bg-green-500"; // Player cell
            } else if (cell === 0) {
              cellClass += " bg-gray-600"; // Wall
            } else {
              cellClass += " bg-white"; // Path
            }
            return <div key={`${rowIndex}-${colIndex}`} className={cellClass} />;
          })
        )}
      </div>

      {/* Winning popup */}
      {gameWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-bold">Congratulations! You've reached the end!</h2>
            <p>You completed the maze in {steps} steps.</p>
            {minSteps && <p>Minimum steps required: {minSteps}</p>}
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={closeModal}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Confetti effect */}
      {gameWon && <Confetti />}
    </div>
  );
};

export default Maze;
