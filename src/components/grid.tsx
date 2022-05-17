import { CELL_SIZE, setCellBackgroundState, setCellType } from "../gridHelpers";
import { Cell, CellPos, CellState } from "./cell";
import { useImmer } from "use-immer";
import { convertStringToCellPos } from "../cellHelpers";
import React, { useEffect, useRef, useState } from "react";
import { cellGotClicked, EventIdentifier } from "../eventIdentifier";
import { dijkstra } from "../algorithms/pathfinder/dijkstra";
import { aStar } from "../algorithms/pathfinder/aStar";
import { depthFirst } from "../algorithms/pathfinder/depthFirst";
import { breadthFirst } from "../algorithms/pathfinder/breadthFirst";
import { recursiveDivision } from "../algorithms/maze/recursiveDivision";

export type GridProps = {
  column: number;
  row: number;
};

export type GridState = {
  cells: CellState[][];
  startCell: CellPos | null;
  targetCell: CellPos | null;
  vistedCells: Record<string, boolean>;
  foundCells: Record<string, boolean>;
  walls: Record<string, boolean>;
  onClick: GridOnclick;
};

export type GridOnclick =
  | "setStartCell"
  | "setTargetCell"
  | "setWallCell"
  | null;

export const Grid = ({ row, column }: GridProps) => {
  const [gridState, setGridState] = useImmer<GridState>(() => {
    return {
      cells: Array<CellState[]>(row).fill(
        Array<CellState>(column).fill({
          type: "defaultCellState",
          backgroundState: "default",
        })
      ),
      startCell: null,
      targetCell: null,
      vistedCells: {},
      foundCells: {},
      walls: {},
      onClick: "setStartCell",
    };
  });

  const canVisualize = !!(gridState.startCell && gridState.targetCell);

  const gridStateRef = useRef(gridState);
  const setGridStateRef = useRef(setGridState);
  const algorithmSelectRef = useRef<HTMLSelectElement | null>(null);
  const mazeGeneratorSelectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    gridStateRef.current = gridState;
    setGridStateRef.current = setGridState;
  }, [gridState, setGridState]);

  useEffect(() => {
    const GridEventIdentifier = new EventIdentifier(
      gridStateRef,
      setGridStateRef
    );

    GridEventIdentifier.subscribeToEvents();

    return () => {
      GridEventIdentifier.unsubscribeFromEvents();
    };
  }, []);

  const onVisualize = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!canVisualize)
      throw Error("Button should be disabled if it can't be visualized");
    Object.keys(gridState.foundCells).forEach((cellsPosInStr) => {
      const cellPos = convertStringToCellPos(cellsPosInStr);

      if (gridState.foundCells[cellsPosInStr]) {
        setGridState((gridState) => {
          setCellBackgroundState(gridState, cellPos, "default");
        });
      }
    });

    Object.keys(gridState.vistedCells).forEach((cellPosInStr) => {
      const cellPos = convertStringToCellPos(cellPosInStr);

      if (gridState.vistedCells[cellPosInStr]) {
        setGridState((gridState) => {
          setCellBackgroundState(gridState, cellPos, "default");
        });
      }
    });

    const avaliableAlgorithm: Record<
      AvailableAlgorithm,
      (
        gridState: GridState,
        onVisitingNode: (cellPos: CellPos) => Promise<void>
      ) => Promise<CellPos[] | null>
    > = {
      dijkstra: dijkstra,
      aStar: aStar,
      dfs: depthFirst,
      bfs: breadthFirst,
    };

    if (algorithmSelectRef.current === null) {
      throw Error("Set selectRef to a valid element");
    }

    const selectedValue = algorithmSelectRef.current
      .value as AvailableAlgorithm;

    const solution = await avaliableAlgorithm[selectedValue](
      gridState,
      async (cellPos: CellPos) => {
        setGridState((gridState) => {
          setCellBackgroundState(gridState, cellPos, "visted");
        });

        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    );

    if (solution !== null) {
      for (const cellPos of solution) {
        setGridState((gridState) => {
          setCellBackgroundState(gridState, cellPos, "found");
        });
        await new Promise((r) => setTimeout(r, 75));
      }
    }
  };
  const resetGridState = () => {
    setGridState({
      cells: Array<CellState[]>(row).fill(
        Array<CellState>(column).fill({
          type: "defaultCellState",
          backgroundState: "default",
        })
      ),
      startCell: null,
      targetCell: null,
      vistedCells: {},
      foundCells: {},
      walls: {},
      onClick: "setStartCell",
    });
  };

  const onClearGrid = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    resetGridState();
  };

  const onGenerateMaze = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    resetGridState();

    await recursiveDivision(gridState, async (cellPos: CellPos) => {
      setGridState((gridState) => {
        setCellType(gridState, cellPos, "wallCellState");
      });

      await new Promise((r) => setTimeout(r, 20));
    });
  };

  return (
    <div className="flex flex-col">
      {gridState.cells.map((rows, rowNum) => {
        return (
          <div key={`row-${rowNum}`} className="flex">
            {rows.map((state, colNum) => {
              return (
                <Cell
                  key={`col-${colNum}}-row-${rowNum}`}
                  size={CELL_SIZE}
                  state={state}
                  pos={{ row: rowNum, column: colNum }}
                  cellGotClicked={cellGotClicked(
                    {
                      column: colNum,
                      row: rowNum,
                    },
                    gridState,
                    setGridState
                  )}
                />
              );
            })}
          </div>
        );
      })}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-5 shadow-lg p-4 rounded bg-gray-100 flex gap-x-2 w-fit">
        <div className="flex gap-x-2">
          <label className="flex items-center justify-center gap-x-2 font-semibold">
            Path finder algorithms :
            <select
              name="algorithm"
              className="rounded px-3 py-2"
              ref={algorithmSelectRef}
              defaultValue="dijkstra"
            >
              <option value="dijkstra">Dijkstra</option>
              <option value="aStar">A*</option>
              <option value="dfs">Depth First Search</option>
              <option value="bfs">Breadth First Search</option>
            </select>
          </label>
          <button
            className="bg-blue-700 rounded px-3 py-2 text-white disabled:opacity-50"
            disabled={!canVisualize}
            onClick={onVisualize}
          >
            Visualise
          </button>
        </div>

        <button
          className="bg-emerald-600 rounded px-3 py-2 text-white disabled:opacity-50"
          onClick={onGenerateMaze}
        >
          Generate Maze
        </button>
        <button
          className="bg-red-700 rounded px-3 py-2 text-white"
          onClick={onClearGrid}
        >
          Clear Grid
        </button>
      </div>
    </div>
  );
};

export type AvailableAlgorithm = "dijkstra" | "aStar" | "dfs" | "bfs";
export type AvailableMazeGenerator = "";
