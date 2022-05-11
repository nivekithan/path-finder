import { CellPos } from "./components/cell";

export const comparCellPos = (first: CellPos, second: CellPos): boolean => {
  return first.row === second.row && first.column === second.column;
};
