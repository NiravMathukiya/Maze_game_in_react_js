import React from 'react';
import Maze from './Maze';
import MazeGame from './components/Mazegamer';
function App() {
  return (
    <>
    <div className="flex flex-col  items-center   justify-center text-center border-2 min-h-screen border-black bg-orange-200">
      <h1 className='text-3xl mb-4 text-center w-full'>Maze game </h1>
      
    {/* <Maze /> */}
    <MazeGame />
    
    </div>
    </>
  );
}

export default App;
