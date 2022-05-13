import { has } from "immer/dist/internal";
import {
  comparCellPos,
  convertCellPosToString,
  convertStringToCellPos,
} from "../cellHelpers";
import { CellPos } from "../components/cell";
import { GridState } from "../components/grid";

export const dijkstra = async (
  gridState: GridState,
  onVisitingNode: (cellPos: CellPos) => void
) => {
  const DijkstraSolution = new DijkstraPathFinder(gridState, onVisitingNode);
  await DijkstraSolution.findSolution();

  return DijkstraSolution.targetPath;
};

class DijkstraPathFinder {
  private readonly gridState: GridState;

  targetPath: CellPos[] | null;

  private calculatedPath: Record<string, CellPos[] | undefined>;
  private minimumKnownDistanceThatsNotVisited: {
    cellPos: CellPos;
    path: CellPos[];
  } | null;

  private visitedCells: Set<string>;

  private onVisitingNode: (cellPos: CellPos) => void;

  constructor(
    gridState: Readonly<GridState>,
    onVisitingNode: (cellPos: CellPos) => void
  ) {
    this.gridState = gridState;
    this.calculatedPath = {};
    this.visitedCells = new Set();
    this.minimumKnownDistanceThatsNotVisited = null;
    this.targetPath = null;
    this.onVisitingNode = onVisitingNode;
  }

  async findSolution() {
    if (this.gridState.startCell === null) {
      throw Error("Start cell is not set");
    }

    if (this.gridState.targetCell === null) {
      throw Error("Target Cell is not set");
    }

    this.setPathOfCellPosFromSource(this.gridState.startCell, [
      this.gridState.startCell,
    ]);

    while (this.getMinimumKnownDistanceThatsNotVisited() !== null) {
      const minimumKnownDistance =
        this.getMinimumKnownDistanceThatsNotVisited();

      if (minimumKnownDistance === null) {
        throw Error("Not possible");
      }

      const { cellPos, path } = minimumKnownDistance;
      this.visitedCells.add(convertCellPosToString(cellPos));
      this.minimumKnownDistanceThatsNotVisited = null;

      if (comparCellPos(cellPos, this.gridState.targetCell)) {
        this.targetPath = path;
        break;
      }

      await this.onVisitingNode(cellPos);

      const adjacentCells = this.getAdjacentCellPos(cellPos);

      adjacentCells.forEach((adjacentCell) => {
        const adjacentCellString = convertCellPosToString(adjacentCell);
        if (this.visitedCells.has(adjacentCellString)) return;

        const newPath = [...path, adjacentCell];
        const distance = this.distanceOfCellPosFromSource(adjacentCell);

        if (newPath.length - 1 < distance) {
          this.setPathOfCellPosFromSource(adjacentCell, newPath);
        }
      });
    }
  }

  distanceOfCellPosFromSource(cellPos: CellPos) {
    const calculatedPath = this.calculatedPath[convertCellPosToString(cellPos)];

    if (calculatedPath === undefined) {
      return Infinity;
    }

    return calculatedPath.length - 1; // THere is no weight to travel to individual cells
  }

  setPathOfCellPosFromSource(cellPos: CellPos, path: CellPos[]) {
    const stringPath = convertCellPosToString(cellPos);

    this.calculatedPath[stringPath] = path;
  }

  getMinimumKnownDistanceThatsNotVisited() {
    if (this.minimumKnownDistanceThatsNotVisited === null) {
      const newMinimumKnowDistance = Object.entries(this.calculatedPath).reduce(
        (acum: [string, CellPos[]] | null, [curCellPos, curPath]) => {
          if (curPath === undefined) {
            throw Error("Not possible");
          }

          if (this.visitedCells.has(curCellPos)) return acum;

          if (acum === null) {
            return [curCellPos, curPath] as [string, CellPos[]];
          }

          const [_, prevPath] = acum;

          if (curPath.length < prevPath.length) {
            return [curCellPos, curPath] as [string, CellPos[]];
          }

          return acum;
        },
        null
      );

      this.minimumKnownDistanceThatsNotVisited =
        newMinimumKnowDistance === null
          ? null
          : {
              cellPos: convertStringToCellPos(newMinimumKnowDistance[0]),
              path: newMinimumKnowDistance[1],
            };

      return this.minimumKnownDistanceThatsNotVisited;
    } else {
      return this.minimumKnownDistanceThatsNotVisited;
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
