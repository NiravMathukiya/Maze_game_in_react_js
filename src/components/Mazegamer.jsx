import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';  // Import a confetti package

const Maze = () => {
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState([1, 1]);  // Player's starting position
  const [start, setStart] = useState([1, 1]);  // Start point
  const [end, setEnd] = useState([13, 13]);   // End point (depends on difficulty)
  const [difficulty, setDifficulty] = useState('easy'); // Default difficulty
  const [mazeSize, setMazeSize] = useState(15); // Default maze size for easy
  const [gameWon, setGameWon] = useState(false); // Track if game is won

  // Update maze size and end position based on difficulty level
  const updateMazeSize = (difficulty) => {
    if (difficulty === 'easy') {
      setMazeSize(15);
      setEnd([13, 13]);
    } else if (difficulty === 'medium') {
      setMazeSize(25);
      setEnd([23, 23]);
    } else if (difficulty === 'hard') {
      setMazeSize(41);
      setEnd([39, 39]);
    } else if (difficulty === 'super-hard') {
      setMazeSize(61);
      setEnd([59, 59]);
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
      grid[x][y] = 1;  // Mark current cell as part of the path
      shuffle(directions);  // Shuffle directions to randomize the maze

      for (let [dx, dy] of directions) {
        const nx = x + dx * 2, ny = y + dy * 2;
        if (nx > 0 && nx < rows && ny > 0 && ny < cols && grid[nx][ny] === 0) {
          grid[x + dx][y + dy] = 1;  // Carve a path between current and next cell
          dfs(nx, ny);  // Recur for the next cell
        }
      }
    };

    dfs(1, 1);  // Start DFS from the top-left corner
    grid[0][1] = 1;  // Ensure entrance
    grid[rows - 2][cols - 1] = 1;  // Ensure exit

    // Ensure Start and End are open and connected
    grid[1][1] = 1;
    grid[rows - 2][cols - 2] = 1;
    return grid;
  };

  useEffect(() => {
    updateMazeSize(difficulty);  // Update maze size based on difficulty
    setMaze(generateMaze(mazeSize, mazeSize));
    setPlayerPos([1, 1]);  // Reset player position to start
    setGameWon(false);  // Reset game won state
  }, [difficulty, mazeSize]);

  // Function to move the player
  const movePlayer = (direction) => {
    const [x, y] = playerPos;  // Current player position
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

      // Check if the player has reached the end of the maze
      if (newX === end[0] && newY === end[1]) {
        setGameWon(true);  // Set game won state to true
      }
    }
  };

  // Add event listener to detect key presses for movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      movePlayer(e.key);  // Call movePlayer with the pressed key
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPos, maze]);

  return (
    <div className="flex flex-col items-center justify-center">

      {/* Difficulty selection */}
      <div className="mb-6">
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

      <div className="grid border-purple-700 p-3" style={{ gridTemplateColumns: `repeat(${maze.length}, 1fr)` }}>
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-4 h-4 border ${
                cell === 1
                  ? 'bg-white border-gray-300'
                  : 'bg-black border-gray-700'
              }`}
              style={{
                ...(rowIndex === playerPos[0] && colIndex === playerPos[1] && {
                  backgroundColor: 'blue',  // Player's current position
                }),
                ...(rowIndex === start[0] && colIndex === start[1] && {
                  backgroundColor: 'red',   // Start position
                }),
                ...(rowIndex === end[0] && colIndex === end[1] && {
                  backgroundColor: 'green', // End position
                }),
              }}
            />
          ))
        )}
      </div>

      {/* Confetti/firecracker effect */}
      {gameWon && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <Confetti />
          <div className="bg-white p-6 shadow-lg rounded text-center">
            <h1 className="text-2xl font-bold">🎉 Congratulations! 🎉</h1>
            <p>You reached the end of the maze!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maze;
