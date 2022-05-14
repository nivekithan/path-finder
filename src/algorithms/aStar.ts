import {
  comparCellPos,
  convertCellPosToString,
  convertStringToCellPos,
} from "../cellHelpers";
import { CellPos } from "../components/cell";
import { GridState } from "../components/grid";

export const aStar = async (
  gridState: GridState,
  onVisitingNode: (cellPos: CellPos) => Promise<void>
) => {
  const AStarSolution = new AStarSolutionFinder(gridState, onVisitingNode);
  await AStarSolution.findSolution();

  return AStarSolution.solution;
};

class AStarSolutionFinder {
  private readonly gridState: GridState;
  private readonly onVisitingNode: (cellPos: CellPos) => Promise<void>;

  private openList: Map<string, CellPos[]>;
  private closeList: Map<string, CellPos[]>;

  solution: CellPos[] | null;

  constructor(
    gridState: GridState,
    onVisitingNode: (cellPos: CellPos) => Promise<void>
  ) {
    this.solution = null;
    this.gridState = gridState;
    this.onVisitingNode = onVisitingNode;
    this.openList = new Map();
    this.closeList = new Map();
  }

  async findSolution() {
    if (this.gridState.startCell === null) {
      throw Error("Set start cell");
    }

    if (this.gridState.targetCell === null) {
      throw Error("Set target cell");
    }

    this.openList.set(convertCellPosToString(this.gridState.startCell), [
      this.gridState.startCell,
    ]);

    outer: while (this.openList.size !== 0) {
      const cellPosInStr = this.findCellWithMinimumFFromOpenList();

      if (cellPosInStr === null) {
        throw Error("Impossible to reach this branch");
      }
      const path = this.openList.get(cellPosInStr);

      if (path === undefined) {
        throw Error("Impossible to reach this branch");
      }

      this.openList.delete(cellPosInStr);

      const cellPos = convertStringToCellPos(cellPosInStr);

      await this.onVisitingNode(cellPos);

      const adjacentCells = this.getAdjacentCellPos(cellPos);

      for (const cellPos of adjacentCells) {
        if (comparCellPos(cellPos, this.gridState.targetCell!)) {
          const solution = [...path, cellPos];
          this.solution = solution;
          break outer;
        }

        const cellPosInStr = convertCellPosToString(cellPos);
        const pathForThatCell = [...path, cellPos];
        const fForThatCell = this.calculateF(cellPos, pathForThatCell);

        if (this.openList.has(cellPosInStr)) {
          const alreadyPresentPath = this.openList.get(cellPosInStr)!;
          const alreadyPresentF = this.calculateF(cellPos, alreadyPresentPath);

          if (alreadyPresentF < fForThatCell) {
            continue;
          }
        }

        if (this.closeList.has(cellPosInStr)) {
          const alreadyPresentPath = this.closeList.get(cellPosInStr)!;
          const alreadyPresentF = this.calculateF(cellPos, alreadyPresentPath);

          if (alreadyPresentF < fForThatCell) {
            continue;
          }
        }

        this.openList.set(cellPosInStr, pathForThatCell);
      }
      this.closeList.set(cellPosInStr, path);
    }
  }

  findCellWithMinimumFFromOpenList() {
    let minF = Infinity;
    let minFKey: string | null = null;

    for (const [key, path] of this.openList) {
      const f = this.calculateF(convertStringToCellPos(key), path);

      if (f < minF) {
        minF = f;
        minFKey = key;
      }
    }

    return minFKey;
  }

  calculateF(cellPos: CellPos, path: CellPos[]) {
    const g = path.length - 1;
    const h = this.calculateH(cellPos);

    return g + h;
  }

  calculateH(cellPos: CellPos) {
    const targetCell = this.gridState.targetCell;

    if (targetCell === null) {
      throw Error("Expected target cell to be set");
    }

    const h =
      Math.abs(cellPos.column - targetCell.column) +
      Math.abs(cellPos.row - targetCell.row);

    return h;
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
