import { WritableDraft } from "immer/dist/internal";
import { convertCellPosToString } from "./cellHelpers";
import { CellPos, CellState } from "./components/cell";
import { GridOnclick, GridState } from "./components/grid";

export const CELL_SIZE = 50;

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
    return "setWallCell";
  }
};

export const getCellState = (
  gridState: GridState,
  cellPos: CellPos
): CellState => {
  return gridState.cells[cellPos.row][cellPos.column];
};

export const setCellType = (
  gridState: WritableDraft<GridState>,
  cellPos: CellPos,
  newCellType: CellState["type"]
) => {
  if (newCellType === "defaultCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    if (currentCellType === "defaultCellState") {
      // Do nothing
    } else if (currentCellType === "startCellState") {
      gridState.startCell = null;
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "targetCellState") {
      gridState.targetCell = null;

      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "wallCellState") {
      delete gridState.walls[convertCellPosToString(cellPos)];
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else {
      throw Error("Add more cases");
    }
  } else if (newCellType === "startCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    if (gridState.startCell) {
      // if startCell is already present change it to default cell
      setCellType(gridState, gridState.startCell, "defaultCellState");
    }

    gridState.startCell = cellPos;

    if (currentCellType === "defaultCellState") {
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "startCellState") {
      // Do nothing
    } else if (currentCellType === "targetCellState") {
      gridState.targetCell = null;
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "wallCellState") {
      delete gridState.walls[convertCellPosToString(cellPos)];
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else {
      throw Error("Add more cases");
    }
  } else if (newCellType === "targetCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    if (gridState.targetCell) {
      // if targetCell is already present change it to default cell
      setCellType(gridState, gridState.targetCell, "defaultCellState");
    }

    gridState.targetCell = cellPos;

    if (currentCellType === "defaultCellState") {
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "startCellState") {
      gridState.startCell = null;
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "targetCellState") {
      // Do nothing
    } else if (currentCellType === "wallCellState") {
      delete gridState.walls[convertCellPosToString(cellPos)];
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else {
      throw Error("Add more cases");
    }
  } else if (newCellType === "wallCellState") {
    const currentCellType = gridState.cells[cellPos.row][cellPos.column].type;

    gridState.walls[convertCellPosToString(cellPos)] = true;
    if (currentCellType === "defaultCellState") {
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "startCellState") {
      gridState.startCell = null;
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "targetCellState") {
      gridState.targetCell = null;
      gridState.cells[cellPos.row][cellPos.column].type = newCellType;
    } else if (currentCellType === "wallCellState") {
      // Do nothing
    } else {
      throw Error("Add more cases");
    }
  } else {
    throw Error("Add more cases");
  }

  sanitizeCellBackgroundState(gridState, cellPos);

  gridState.onClick = computeNextOnlick(gridState);
};

const sanitizeCellBackgroundState = (
  gridState: GridState,
  cellPos: CellPos
) => {
  const cellState = gridState.cells[cellPos.row][cellPos.column] as {
    type: string;
    backgroundState: string;
  };

  if (cellState.type === "targetCellState") {
    if (cellState.backgroundState === "visted") {
      setCellBackgroundState(gridState, cellPos, "default");
    }
  } else if (cellState.type === "wallCellState") {
    setCellBackgroundState(gridState, cellPos, "default");
  }
};

export const setCellBackgroundState = (
  gridState: WritableDraft<GridState>,
  cellPos: CellPos,
  newCellBackground: CellState["backgroundState"]
) => {
  const currentCellBackground =
    gridState.cells[cellPos.row][cellPos.column].backgroundState;

  if (currentCellBackground === "visted") {
    delete gridState.vistedCells[convertCellPosToString(cellPos)];
  } else if (currentCellBackground === "found") {
    delete gridState.foundCells[convertCellPosToString(cellPos)];
  }

  if (newCellBackground === "found") {
    gridState.foundCells[convertCellPosToString(cellPos)] = true;
  } else if (newCellBackground === "visted") {
    gridState.vistedCells[convertCellPosToString(cellPos)] = true;
  }

  gridState.cells[cellPos.row][cellPos.column].backgroundState =
    newCellBackground;

  sanitizeCellType(gridState, cellPos);
};

const sanitizeCellType = (gridState: GridState, cellPos: CellPos) => {
  const cellState = gridState.cells[cellPos.row][cellPos.column] as {
    type: string;
    backgroundState: string;
  };

  if (cellState.backgroundState === "visted") {
    if (
      cellState.type === "targetCellState" ||
      cellState.type === "wallCellState"
    ) {
      setCellType(gridState, cellPos, "defaultCellState");
    }
  } else if (cellState.backgroundState === "found") {
    if (cellState.type === "wallCellState") {
      setCellType(gridState, cellPos, "defaultCellState");
    }
  }
};
