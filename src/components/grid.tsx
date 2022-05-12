import { CELL_SIZE, computeNextOnlick, setCellType } from "../gridHelpers";
import { Cell, CellPos, CellState } from "./cell";
import { Updater, useImmer } from "use-immer";
import { comparCellPos } from "../cellHelpers";
import { useEffect, useRef } from "react";
import { EventIdentifier } from "../eventIdentifier";

export type GridProps = {
  column: number;
  row: number;
};

export type GridState = {
  cells: CellState[][];
  startCell: CellPos | null;
  targetCell: CellPos | null;
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
        Array<CellState>(column).fill({ type: "defaultCellState" })
      ),
      startCell: null,
      targetCell: null,
      walls: {},
      onClick: "setStartCell",
    };
  });

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

  return (
    <div className="flex flex-col">
      {gridState.cells.map((rows, rowNum) => {
        return (
          <div key={`row-${rowNum}`} className="flex">
            {rows.map((state, colNum) => {
              return (
                <Cell
                  key={`col-${colNum}}`}
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
    </div>
  );
};

const cellGotClicked = (
  pos: CellPos,
  gridState: GridState,
  setGridState: Updater<GridState>
) => {
  return () => {
    if (gridState.cells[pos.row][pos.column].type !== "defaultCellState") {
      // If clicked cell is anything other then default cell then we will set it to default
      setGridState((prevState) => {
        setCellType(prevState, pos, { type: "defaultCellState" });
      });
    }
    // New cell is clicked
    else if (gridState.onClick === "setStartCell") {
      setGridState((prevState) => {
        setCellType(prevState, pos, { type: "startCellState" });
      });
    } else if (gridState.onClick === "setTargetCell") {
      setGridState((gridState) => {
        setCellType(gridState, pos, { type: "targetCellState" });
      });
    } else if (gridState.onClick === "setWallCell") {
      setGridState((gridState) => {
        setCellType(gridState, pos, { type: "wallCellState" });
      });
    } else if (gridState.onClick === null) {
      return;
    } else {
      throw Error("Add more cases");
    }
  };
};
