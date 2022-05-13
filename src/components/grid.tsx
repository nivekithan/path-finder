import {
  CELL_SIZE,
  computeNextOnlick,
  setCellBackgroundState,
  setCellType,
} from "../gridHelpers";
import { Cell, CellPos, CellState } from "./cell";
import { Updater, useImmer } from "use-immer";
import { comparCellPos, convertStringToCellPos } from "../cellHelpers";
import React, { useEffect, useRef, useState } from "react";
import { cellGotClicked, EventIdentifier } from "../eventIdentifier";
import { dijkstra } from "../algorithms/dijkstra";

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

    const solution = dijkstra(gridState);

    if (solution !== null) {
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

      for (const cellPos of solution) {
        setGridState((gridState) => {
          setCellBackgroundState(gridState, cellPos, "found");
        });
        await new Promise((r) => setTimeout(r, 75));
      }
    }
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
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-5 shadow-lg p-4 rounded bg-gray-100">
        <button
          className="bg-blue-700 rounded px-3 py-2 text-white disabled:opacity-50"
          disabled={!canVisualize}
          onClick={onVisualize}
        >
          Visualise
        </button>
      </div>
    </div>
  );
};
