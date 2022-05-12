import { WritableDraft } from "immer/dist/internal";
import { CellPos, CellState } from "./components/cell";
import { GridOnclick, GridState } from "./components/grid";

export const CELL_SIZE = 35;

export const getViewportDimension = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return { width, height };
};

export const getGridDemensions = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const columns = Math.floor(width / CELL_SIZE);
  const rows = Math.floor(height / CELL_SIZE);

  return { columns, rows };
};

export const computeNextOnlick = (gridState: GridState): GridOnclick => {
  if (gridState.startCell === null) {
    return "setStartCell";
  } else if (gridState.targetCell === null) {
    return "setTargetCell";
  } else {
    return null;
  }
};

export const setCellType = (
  gridState: WritableDraft<GridState>,
  cellPos: CellPos,
  newCellType: CellState
) => {
  if (newCellType.type === "defaultCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    if (currentCellType === "defaultCellState") {
      // Do nothing
    } else if (currentCellType === "startCellState") {
      gridState.startCell = null;
      gridState.cells[cellPos.row][cellPos.column] = newCellType;
    } else if (currentCellType === "targetCellState") {
      gridState.targetCell = null;

      gridState.cells[cellPos.row][cellPos.column] = newCellType;
    } else {
      throw Error("Add more cases");
    }
  } else if (newCellType.type === "startCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    if (gridState.startCell) {
      // if startCell is already present change it to default cell
      setCellType(gridState, gridState.startCell, { type: "defaultCellState" });
    }

    gridState.startCell = cellPos;

    if (currentCellType === "defaultCellState") {
      gridState.cells[cellPos.row][cellPos.column] = newCellType;
    } else if (currentCellType === "startCellState") {
      // Do nothing
    } else if (currentCellType === "targetCellState") {
      gridState.targetCell = null;
      gridState.cells[cellPos.row][cellPos.column] = newCellType;
    } else {
      throw Error("Add more cases");
    }
  } else if (newCellType.type === "targetCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    if (gridState.targetCell) {
      // if targetCell is already present change it to default cell
      setCellType(gridState, gridState.targetCell, {
        type: "defaultCellState",
      });
    }

    gridState.targetCell = cellPos;

    if (currentCellType === "defaultCellState") {
      gridState.cells[cellPos.row][cellPos.column] = newCellType;
    } else if (currentCellType === "startCellState") {
      gridState.startCell = null;
      gridState.cells[cellPos.row][cellPos.column] = newCellType;
    } else if (currentCellType === "targetCellState") {
      // Do nothing
    } else {
      throw Error("Add more cases");
    }
  } else {
    throw Error("Add more cases");
  }

  gridState.onClick = computeNextOnlick(gridState);
};
