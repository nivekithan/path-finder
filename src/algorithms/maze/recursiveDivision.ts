import { comparCellPos, convertCellPosToString } from "../../cellHelpers";
import { CellPos } from "../../components/cell";
import { GridState } from "../../components/grid";

export const recursiveDivision = async (
  gridState: GridState,
  onSettingWall: (cellPos: CellPos) => Promise<void>
) => {
  const MazeGenerator = new RecursiveDivisionMazeGenerator(
    gridState,
    onSettingWall
  );

  await MazeGenerator.setWall();
};

class RecursiveDivisionMazeGenerator {
  private readonly gridState: GridState; // Assume grid is cleared, i.e there is no start,target or wall cell
  private readonly onSettingWall: (cellPos: CellPos) => Promise<void>;

  constructor(
    gridState: GridState,
    onSettingWall: (cellPos: CellPos) => Promise<void>
  ) {
    this.gridState = gridState;
    this.onSettingWall = onSettingWall;
  }

  async setWall() {
    await this.drawBorder();
    const height = this.gridState.cells.length - 2;
    const width = this.gridState.cells[0].length - 2;
    await this.divide(
      { column: 1, row: 1 },
      width,
      height,
      this.getOrientation(width, height),
      {}
    );
  }

  async divide(
    startCellPos: Readonly<CellPos>,
    width: number,
    height: number,
    orientation: "H" | "V", // Horizontal or vertical
    restrictedCells: Record<string, boolean>
  ) {
    if (width < 2 || height < 2) return;

    const horizontal = orientation === "H";

    const drawCellPos: CellPos = {
      column:
        startCellPos.column + (horizontal ? 0 : getRandomOddInt(1, width - 1)),
      row: startCellPos.row + (horizontal ? getRandomOddInt(1, height - 1) : 0),
    };

    const passageCellPos: CellPos = {
      column:
        drawCellPos.column + (horizontal ? getRandomOddInt(1, width - 1) : 0),
      row: drawCellPos.row + (horizontal ? 0 : getRandomOddInt(1, height - 1)),
    };

    restrictedCells[
      horizontal
        ? convertCellPosToString({
            column: passageCellPos.column,
            row: passageCellPos.row + 1,
          })
        : convertCellPosToString({
            column: passageCellPos.column + 1,
            row: passageCellPos.row,
          })
    ] = true;
    restrictedCells[
      horizontal
        ? convertCellPosToString({
            column: passageCellPos.column,
            row: passageCellPos.row - 1,
          })
        : convertCellPosToString({
            column: passageCellPos.column - 1,
            row: passageCellPos.row,
          })
    ] = true;

    const length = horizontal ? width : height;

    for (let i = 0; i < length; i++) {
      if (
        !comparCellPos(passageCellPos, drawCellPos) &&
        !restrictedCells[convertCellPosToString(drawCellPos)]
      ) {
        await this.onSettingWall(drawCellPos);
      }
      horizontal ? drawCellPos.column++ : drawCellPos.row++;
    }

    const newWidth1 = horizontal
      ? width
      : passageCellPos.column - startCellPos.column;
    const newHeight1 = horizontal
      ? passageCellPos.row - startCellPos.row
      : height;

    this.divide(
      startCellPos,
      newWidth1,
      newHeight1,
      this.getOrientation(newWidth1, newHeight1),
      restrictedCells
    );

    const newStartCellPos: CellPos = horizontal
      ? { column: startCellPos.column, row: passageCellPos.row + 1 }
      : { row: startCellPos.row, column: passageCellPos.column + 1 };
    const newWidth2 = horizontal ? width : width - (newWidth1 + 1);
    const newHeight2 = horizontal ? height - (newHeight1 + 1) : height;

    this.divide(
      newStartCellPos,
      newWidth2,
      newHeight2,
      this.getOrientation(newWidth2, newHeight2),
      restrictedCells
    );
  }
  getOrientation(width: number, height: number): "H" | "V" {
    if (width < height) {
      return "H";
    } else if (height < width) {
      return "V";
    } else {
      return getRandomOddInt(0, 2) === 0 ? "H" : "V";
    }
  }

  async drawBorder() {
    const noOfColumns = this.gridState.cells[0].length - 1;
    const noOfRows = this.gridState.cells.length - 1;

    if (!(noOfColumns >= 2) || !(noOfRows >= 2)) {
      throw Error(
        "Cannot draw recursive division on maze which does not have more than two row and two column"
      );
    }

    const currentPos: CellPos = { column: 0, row: 0 };
    let reachedTopLeft = false;

    let currentState: "TopLeft" | "TopRight" | "BottomRight" | "BottomLeft" =
      "TopLeft";

    while (true) {
      const isTopLeft = comparCellPos(currentPos, { column: 0, row: 0 });

      const isTopRight = comparCellPos(currentPos, {
        column: noOfColumns,
        row: 0,
      });
      const isBottomRight = comparCellPos(currentPos, {
        column: noOfColumns,
        row: noOfRows,
      });
      const isBottomLeft = comparCellPos(currentPos, {
        column: 0,
        row: noOfRows,
      });

      if (isTopLeft) {
        if (reachedTopLeft) {
          break;
        }
        reachedTopLeft = true;
        currentState = "TopLeft";
      } else if (isTopRight) {
        currentState = "TopRight";
      } else if (isBottomRight) {
        currentState = "BottomRight";
      } else if (isBottomLeft) {
        currentState = "BottomLeft";
      }

      await this.onSettingWall(currentPos);

      if (currentState === "TopLeft") {
        currentPos.column++;
      } else if (currentState === "TopRight") {
        currentPos.row++;
      } else if (currentState === "BottomRight") {
        currentPos.column--;
      } else if (currentState === "BottomLeft") {
        currentPos.row--;
      }
    }
  }
}

export const getRandomOddInt = (min: number, max: number) => {
  if (min % 2 === 0) {
    return min + getRandomOddNUmber(max - min);
  } else {
    return min + getRandomEvenNumber(max - min);
  }
};

const getRandomEvenNumber = (max: number) => {
  return Math.floor(Math.random() * (max / 2)) * 2;
};

const getRandomOddNUmber = (max: number) => {
  return Math.floor(Math.random() * ((max - 1) / 2)) * 2 + 1;
};
