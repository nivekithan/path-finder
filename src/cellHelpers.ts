import { CellPos } from "./components/cell";

export const comparCellPos = (first: CellPos, second: CellPos): boolean => {
  return first.row === second.row && first.column === second.column;
};

export const convertCellPosToString = (cellPos: CellPos): string => {
  return `${cellPos.row}-${cellPos.column}`;
};

export const convertStringToCellPos = (cellPosString: string): CellPos => {
  const [row, column] = cellPosString.split("-");
  return { row: parseInt(row, 10), column: parseInt(column, 10) };
};
