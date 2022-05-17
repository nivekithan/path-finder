import { comparCellPos, convertCellPosToString } from "../../cellHelpers";
import { CellPos } from "../../components/cell";
import { GridState } from "../../components/grid";

export const breadthFirst = async (
  gridState: GridState,
  onVisitingCell: (cellPos: CellPos) => Promise<void>
) => {
  const BreadthFirstSolution = new BreadthFirstSolutionFinder(
    gridState,
    onVisitingCell
  );

  const solution = await BreadthFirstSolution.findSolution();

  return solution;
};

class BreadthFirstSolutionFinder {
  private readonly gridState: GridState;
  private readonly onVisitingCell: (cellpos: CellPos) => Promise<void>;

  private visitedCells: Map<string, boolean>;
  private travelledPath: CellPos[];
  private solution: CellPos[] | null;

  constructor(
    gridState: GridState,
    onVisitingCell: (cellPos: CellPos) => Promise<void>
  ) {
    this.gridState = gridState;
    this.onVisitingCell = onVisitingCell;
    this.travelledPath = [];
    this.visitedCells = new Map();
    this.solution = null;

    if (this.gridState.startCell === null) {
      throw Error("Start cell is not set");
    }

    if (this.gridState.targetCell === null) {
      throw Error("Target cell is not set");
    }
  }

  async findSolution() {
    const cellPos = this.gridState.startCell!;

    const queue = [cellPos];

    outer: while (queue.length !== 0) {
      const cellPos = queue.shift()!;
      const adjacentCells = this.getAdjacentCellPos(cellPos);

      for (const cellPos of adjacentCells) {
        if (!this.visitedCells.get(convertCellPosToString(cellPos))) {
          if (comparCellPos(this.gridState.targetCell!, cellPos)) {
            this.travelledPath.push(cellPos);
            this.solution = this.travelledPath;
            break outer;
          }

          this.visitedCells.set(convertCellPosToString(cellPos), true);
          this.travelledPath.push(cellPos);
          await this.onVisitingCell(cellPos);
          queue.push(cellPos);
        }
      }
    }

    return this.solution;
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
