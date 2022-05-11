import { CELL_SIZE } from "../gridHelpers";
import { Cell, CellPos, CellState } from "./cell";
import { Updater, useImmer } from "use-immer";
import { comparCellPos } from "../cellHelpers";

export type GridProps = {
  column: number;
  row: number;
};

export type GridState = {
  cells: CellState[][];
  startCell: CellPos | null;
  targetCell: CellPos | null;
  onClick: GridOnclick;
};

export type GridOnclick = "setStartCell" | "setTargetCell" | null;

export const Grid = ({ row, column }: GridProps) => {
  const [gridState, setGridState] = useImmer<GridState>(() => {
    return {
      cells: Array<CellState[]>(row).fill(
        Array<CellState>(column).fill({ type: "defaultCellState" })
      ),
      startCell: null,
      targetCell: null,
      onClick: "setStartCell",
    };
  });

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
    if (gridState.startCell && comparCellPos(gridState.startCell, pos)) {
      // Remove the start cell
      setGridState((prevState) => {
        prevState.startCell = null;
        prevState.cells[pos.row][pos.column] = { type: "defaultCellState" };
        prevState.onClick = computeNextOnlick(prevState);
      });
    } else if (
      gridState.targetCell &&
      comparCellPos(gridState.targetCell, pos)
    ) {
      // Remove Target cell

      setGridState((prevState) => {
        prevState.targetCell = null;
        prevState.cells[pos.row][pos.column] = { type: "defaultCellState" };
        prevState.onClick = computeNextOnlick(prevState);
      });
    }
    // New cell is clicked
    else if (gridState.onClick === "setStartCell") {
      setGridState((prevState) => {
        prevState.startCell = pos;

        prevState.cells[pos.row][pos.column] = { type: "startCellState" };

        prevState.onClick = computeNextOnlick(prevState);
      });
    } else if (gridState.onClick === "setTargetCell") {
      setGridState((prevState) => {
        prevState.targetCell = pos;
        prevState.cells[pos.row][pos.column] = { type: "targetCellState" };
        prevState.onClick = computeNextOnlick(prevState);
      });
    } else if (gridState.onClick === null) {
      return;
    }
  };
};

const computeNextOnlick = (gridState: GridState): GridOnclick => {
  if (gridState.startCell === null) {
    return "setStartCell";
  } else if (gridState.targetCell === null) {
    return "setTargetCell";
  } else {
    return null;
  }
};
