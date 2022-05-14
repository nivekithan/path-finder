import {
  comparCellPos,
  convertCellPosToString,
  convertStringToCellPos,
} from "../cellHelpers";
import { CellPos } from "../components/cell";
import { GridState } from "../components/grid";

export const depthFirst = async (
  gridState: GridState,
  onVisitingCell: (cellPos: CellPos) => Promise<void>
) => {
  const DepthFirstSolution = new DepthFirstSolutionFinder(
    gridState,
    onVisitingCell
  );

  await DepthFirstSolution.findSolution();

  return DepthFirstSolution.solution;
};

class DepthFirstSolutionFinder {
  private readonly gridState: GridState;
  private readonly onVisitingCell: (cellPos: CellPos) => Promise<void>;

  solution: CellPos[] | null;

  private visitedMap: Map<string, boolean>;
  private travelledPath: CellPos[];

  constructor(
    gridState: GridState,
    onVisitingCell: (cellPos: CellPos) => Promise<void>
  ) {
    this.gridState = gridState;
    this.onVisitingCell = onVisitingCell;
    this.visitedMap = new Map();
    this.travelledPath = [];
    this.solution = null;

    if (this.gridState.startCell === null) {
      throw Error("Start cell is not set");
    }

    if (this.gridState.targetCell === null) {
      throw Error("Target Cell is not set");
    }
  }

  async findSolution() {
    const startCell = this.gridState.startCell!;

    await this.dfs(startCell);
  }

  async dfs(cellPos: CellPos) {
    if (this.solution === null) {
      if (comparCellPos(this.gridState.targetCell!, cellPos)) {
        this.travelledPath.push(cellPos);
        this.solution = this.travelledPath;

        return;
      }

      this.visitedMap.set(convertCellPosToString(cellPos), true);
      await this.onVisitingCell(cellPos);
      this.travelledPath.push(cellPos);

      const adjacentCells = this.getAdjacentCellPos(cellPos);

      for (const cellPos of adjacentCells) {
        if (!this.visitedMap.get(convertCellPosToString(cellPos))) {
          await this.dfs(cellPos);
        }
      }
    } else {
      return;
    }
  }

  getAdjacentCellPos(cellPos: CellPos): CellPos[] {
    const allPossibleCells: CellPos[] = [
      { column: cellPos.column + 1, row: cellPos.row },
      { column: cellPos.column - 1, row: cellPos.row },
      { column: cellPos.column, row: cellPos.row + 1 },
      { column: cellPos.column, row: cellPos.row - 1 },
    ];

    const adjacentCells = allPossibleCells.filter((cellPos) => {
      if (
        cellPos.column < 0 ||
        cellPos.column >= this.gridState.cells[0].length
      )
        return false;

      if (cellPos.row < 0 || cellPos.row >= this.gridState.cells.length)
        return false;

      const cellState = this.gridState.cells[cellPos.row][cellPos.column];

      if (cellState.type === "wallCellState") return false;

      return true;
    });

    return adjacentCells;
  }
}
