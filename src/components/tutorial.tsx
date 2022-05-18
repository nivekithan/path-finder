import React, { useRef, useState } from "react";

const TOTAL_PAGE = 6;

export const Tutorial = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const onSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setShowTutorial(false);
  };

  const onNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentPage === TOTAL_PAGE) {
      setShowTutorial(false);
    } else {
      setCurrentPage((p) => p + 1);
    }
  };

  const onPrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentPage((p) => p - 1);
  };

  return showTutorial ? (
    <dialog
      open
      className="rounded-lg shadow-md border-1 border-black border fixed inset-0 z-30 w-[50%] h-[70%]"
    >
      <div className="flex flex-col items-center gap-y-5 p-4 h-full ">
        <Page pageNo={currentPage} />
        <div className="flex justify-between w-full mt-auto">
          <button
            className="bg-emerald-700 rounded px-4 py-2 text-white"
            onClick={onSkip}
          >
            Skip
          </button>
          <div className="flex grow justify-end gap-x-4">
            <button
              className="bg-blue-500 rounded px-4 py-2 text-white disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={onPrevious}
            >
              Previous
            </button>
            <button
              className="bg-blue-500 rounded px-4 py-2 text-white disabled:opacity-50"
              onClick={onNext}
            >
              {currentPage === TOTAL_PAGE ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  ) : null;
};

type PageProps = {
  pageNo: number;
};

const Page = ({ pageNo }: PageProps) => {
  return Pages[pageNo];
};

const Pages: { [index: number]: React.ReactElement } = {
  1: (
    <>
      <h1 className="text-3xl font-bold text-center">
        Welcome to Pathfinding visualizer
      </h1>
      <p className="text-xl text-center">
        This short tutorial will walk through all of the features of this
        application
      </p>
      <p className="text-center">
        If you want to dive right in, feel free to press the "Skip Tutorial"
        button below. Otherwise, press "Next"!
      </p>
      <img src="/logo.png" alt="Pathfinder logo" className="rounded-md" />
    </>
  ),

  2: (
    <>
      <h1 className="text-3xl font-bold text-center">
        What is a pathfinding algorithm
      </h1>
      <p className="text-xl text-center">
        At its core, a pathfinding algorithm seeks to find the shortest path
        between two points. This application visualizes various pathfinding
        algorithms in action, and more!
      </p>
      <p className="text-center">
        All of the algorithms on this application are adapted for a 2D grid,
        where 90 degree turns have a "cost" of 1 and movements from a node to
        another have a "cost" of 1.
      </p>
      <img
        src="/path-finding.jpg"
        alt="Finding path"
        className="rounded-md w-[20rem] h-[20rem]"
      />
    </>
  ),

  3: (
    <>
      <h1 className="text-3xl font-bold text-center">Picking an algorithm</h1>
      <p className="text-xl text-center">
        Choose an algorithm from the "Algorithms" drop-down menu.
      </p>
      <img
        src="/choose-algorithm.png"
        alt="Choose Algorithm"
        className="rounded-md"
      />
    </>
  ),

  4: (
    <>
      <h1 className="text-3xl font-bold text-center">Meet the algorithms</h1>
      <p className="text-xl text-center">
        Not all algorithms are created equal
      </p>
      <ul className="text-center flex flex-col justify-between h-full text-lg">
        <li>
          <span className="font-bold"> Dijkstra Algorithm</span> : the father of
          pathfinding algorithms; guarantees the shortest path
        </li>
        <li>
          <span className="font-bold"> A* Search</span> : arguably the best
          pathfinding algorithm; uses heuristics to guarantee the shortest path
          much faster than Dijkstra's Algorithm
        </li>
        <li>
          <span className="font-bold"> Breath-first Search</span> : a great
          algorithm; guarantees the shortest path
        </li>
        <li>
          <span className="font-bold"> Depth-first Search</span> : a very bad
          algorithm for pathfinding; does not guarantee the shortest path
        </li>
      </ul>
    </>
  ),

  5: (
    <>
      <h1 className="text-3xl font-bold text-center">Adding walls </h1>
      <p className="text-xl text-center">
        Click on the grid to add a wall after adding start and end cell. Click
        "Generate maze" to genreate maze
      </p>
      <p className="text-center">
        Walls are impenetrable, meaning that a path cannot cross through them
      </p>
      <video
        src="/start-target-walls.mp4"
        className="rounded-md w-[20rem] h-[20rem]"
        autoPlay
        loop
      />
    </>
  ),
  6: (
    <>
      <h1 className="text-3xl font-bold text-center">Visualizing and more</h1>
      <p className="text-xl text-center">
        Use the buttons at the bottom of the screen to visualize algorithm and
        to do other stuff
      </p>
      <p className="text-center">
        You can clear the grid, visualize the algorithm and generate mazes
      </p>
      <video
        src="/visualize-algorithm.mp4"
        className="rounded-md w-[30rem] h-[30rem]"
        autoPlay
        loop
      />
    </>
  ),
};
