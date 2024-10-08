import React, { useState, useEffect, useRef } from 'react';

const Maze = () => {
  const canvasRef = useRef(null);
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(10); // Default easy size
  const [completed, setCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mazeImage, setMazeImage] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false); // Track game state

  // Effect to generate maze when size changes
  useEffect(() => {
    generateMaze(size);
  }, [size]);

  // Effect to handle key presses for player movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameActive && !completed) {
        movePlayer(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPos, completed, isGameActive]);

  // Generate a new maze
  const generateMaze = (size) => {
    const newMaze = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.random() < 0.3 ? -1 : 1)
    );

    // Ensure start and end points are accessible
    newMaze[0][0] = 1; // Start point
    newMaze[size - 1][size - 1] = 1; // End point

    // Create paths from start to end
    for (let i = 0; i < size; i++) {
      // Keep the first row and first column clear to ensure paths from the start
      if (i < size - 1) newMaze[i][0] = 1; // Vertical path
      if (i < size - 1) newMaze[0][i] = 1; // Horizontal path
    }

    // Randomize other cells but ensure paths to the exit are always there
    for (let i = 1; i < size - 1; i++) {
      for (let j = 1; j < size - 1; j++) {
        newMaze[i][j] = Math.random() < 0.3 ? -1 : 1; // Randomize walls
      }
    }

    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setCompleted(false);
    setMoves(0);
  };

  // Move the player based on arrow key presses
  const movePlayer = (key) => {
    const { x, y } = playerPos;
    let newX = x;
    let newY = y;

    switch (key) {
      case 'ArrowUp':
        if (x > 0) newX--;
        break;
      case 'ArrowDown':
        if (x < size - 1) newX++;
        break;
      case 'ArrowLeft':
        if (y > 0) newY--;
        break;
      case 'ArrowRight':
        if (y < size - 1) newY++;
        break;
      default:
        break;
    }

    // Check if the new position is valid
    if (newX >= 0 && newX < size && newY >= 0 && newY < size && maze[newX][newY] === 1) {
      setPlayerPos({ x: newX, y: newY });
      setMoves((prevMoves) => prevMoves + 1);

      // Check for completion
      if (newX === size - 1 && newY === size - 1) {
        setCompleted(true);
      }
    }
  };

  // Load the maze image
  useEffect(() => {
    const img = new Image();
    img.src = 'https://example.com/maze-image.png'; // Replace with your image URL
    img.onload = () => {
      setMazeImage(img);
      setImageLoaded(true);
    };
  }, []);

  // Draw the maze and player on the canvas
  const drawMaze = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = 500 / size;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    if (imageLoaded) {
      ctx.drawImage(mazeImage, 0, 0, canvas.width, canvas.height);
    } else {
      for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
          ctx.fillStyle = maze[i][j] === -1 ? 'gray' : 'transparent'; 
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize); // Draw cell

          // Draw borders based on cell type
          if (maze[i][j] === 1) {
            ctx.strokeStyle = 'black'; // Border color
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize); // Draw border
          }
        }
      }
      
      // Draw the destination cell (bottom-right corner)
      ctx.fillStyle = 'green'; // Destination color
      ctx.fillRect((size - 1) * cellSize, (size - 1) * cellSize, cellSize, cellSize); // Draw destination cell
    }

    // Draw player
    ctx.fillStyle = 'red'; // Player color
    ctx.fillRect(playerPos.y * cellSize + cellSize * 0.2, playerPos.x * cellSize + cellSize * 0.2, cellSize * 0.6, cellSize * 0.6);
  };

  // Effect to draw maze when maze or player position changes
  useEffect(() => {
    drawMaze();
  }, [maze, playerPos]);

  const handleStart = () => {
    if (isGameActive) {
      // If game is already active, reset it
      setIsGameActive(false);
      setCompleted(false);
      generateMaze(size);
    } else {
      // Start the game
      setIsGameActive(true);
      generateMaze(size);
    }
  };

  return (
    <div className="text-center">
      <div className="flex mb-4 justify-center">
        <select
          className="border rounded p-2 mr-2"
          onChange={(e) => setSize(Number(e.target.value))}
        >
          <option value={10}>Easy</option>
          <option value={15}>Medium</option>
          <option value={25}>Hard</option>
          <option value={38}>Extreme</option>
        </select>
        <button
          className="bg-blue-500 text-white rounded p-2"
          onClick={handleStart}
        >
          {isGameActive ? "Restart" : "Start Game"}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="border-4 border-black"
      />
      {completed && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">You completed the maze in {moves} moves!</h2>
        </div>
      )}
    </div>
  );
};

export default Maze;
