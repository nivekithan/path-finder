import React, { MutableRefObject } from "react";
import { Updater } from "use-immer";
import { comparCellPos, convertCellPosToString } from "./cellHelpers";
import { CellPos } from "./components/cell";
import { GridState } from "./components/grid";
import { computeNextOnlick, getCellState, setCellType } from "./gridHelpers";

type EventIdentifierState =
  | {
      type: "pressedDownOnStartCell";
      startCell: CellPos;
    }
  | { type: "pressedDownOnTargetCell"; targetCell: CellPos }
  | {
      type: "paintWallCell";
      startedFrom: CellPos;
      passedThrough: Record<string, boolean>;
      currentlyOverCell: CellPos;
    }
  | null;

let isOnClickHandled = false;

export class EventIdentifier {
  gridStateRef: Readonly<MutableRefObject<GridState>>;
  setGridStateRef: Readonly<MutableRefObject<Updater<GridState>>>;

  originalPressedOnCell: CellPos | null;

  state: EventIdentifierState;

  private handleNativePointerDownEvent(e: Event) {
    if (e.type === "pointerdown") {
      this.dispatchPointerDown(e as PointerEvent);
    }
  }

  private handleNativePointerUpEvent(e: Event) {
    if (e.type === "pointerup") {
      this.dispatchPointerUp(e as PointerEvent);
    }
  }

  private handleNativePointerCancelEvent(e: Event) {
    if (e.type === "pointercancel") {
      this.dispatchPointerCancel(e as PointerEvent);
    }
  }

  private handleNativePointerOverEvent(e: Event) {
    if (e.type === "pointerover") {
      this.dispatchPointerOver(e as PointerEvent);
    }
  }

  subscribeToEvents() {
    window.addEventListener("pointerdown", this.handleNativePointerDownEvent);
    window.addEventListener("pointerup", this.handleNativePointerUpEvent);
    window.addEventListener(
      "pointercancel",
      this.handleNativePointerCancelEvent
    );
    window.addEventListener("pointerover", this.handleNativePointerOverEvent);
  }

  unsubscribeFromEvents() {
    window.removeEventListener(
      "pointerdown",
      this.handleNativePointerDownEvent
    );
    window.removeEventListener("pointerup", this.handleNativePointerUpEvent);
    window.removeEventListener(
      "pointercancel",
      this.handleNativePointerCancelEvent
    );
    window.removeEventListener(
      "pointerover",
      this.handleNativePointerOverEvent
    );
  }

  constructor(
    gridStateRef: MutableRefObject<GridState>,
    setGridStateRef: MutableRefObject<Updater<GridState>>
  ) {
    this.gridStateRef = gridStateRef;
    this.setGridStateRef = setGridStateRef;
    this.state = null;
    this.originalPressedOnCell = null;

    this.handleNativePointerDownEvent =
      this.handleNativePointerDownEvent.bind(this);
    this.handleNativePointerUpEvent =
      this.handleNativePointerUpEvent.bind(this);
    this.handleNativePointerCancelEvent =
      this.handleNativePointerCancelEvent.bind(this);
    this.handleNativePointerOverEvent =
      this.handleNativePointerOverEvent.bind(this);
  }

  dispatchPointerDown(e: PointerEvent) {
    const cellPos = getCellPosFromComposedPath(e.composedPath());

    if (cellPos === null) return;

    this.originalPressedOnCell = cellPos;

    const cellState = getCellState(this.gridStateRef.current, cellPos);

    if (cellState.type === "startCellState") {
      this.state = { type: "pressedDownOnStartCell", startCell: cellPos };
    } else if (cellState.type === "targetCellState") {
      this.state = { type: "pressedDownOnTargetCell", targetCell: cellPos };
    } else if (
      cellState.type === "defaultCellState" ||
      cellState.type === "wallCellState"
    ) {
      this.state = {
        type: "paintWallCell",
        currentlyOverCell: cellPos,
        startedFrom: cellPos,
        passedThrough: { [convertCellPosToString(cellPos)]: true },
      };
    } else {
    }
  }

  dispatchPointerUp(e: PointerEvent) {
    const cellPos = getCellPosFromComposedPath(e.composedPath());

    if (cellPos === null) {
      this.state = null;
      return;
    }
    if (this.state?.type === "paintWallCell") {
      if (
        comparCellPos(this.state.startedFrom, cellPos) &&
        Object.keys(this.state.passedThrough).length > 1
      ) {
        // When paintWallCell is active, the user may drop the pointer on the startedCell
        // which will register as click, this is cause onClickhandler to run also
        // which wre have to prevent
        isOnClickHandled = true;
      }
    } else if (
      this.originalPressedOnCell
        ? comparCellPos(this.originalPressedOnCell, cellPos)
        : false
    ) {
      this.state = null;
      return; // this is a click event which is handled by the cell itself
    }

    if (this.state?.type === "pressedDownOnStartCell") {
      this.setGridStateRef.current((gridState) => {
        setCellType(gridState, cellPos, "startCellState");
      });
    } else if (this.state?.type === "pressedDownOnTargetCell") {
      this.setGridStateRef.current((gridState) => {
        setCellType(gridState, cellPos, "targetCellState");
      });
    }
    this.state = null;
  }

  dispatchPointerOver(e: PointerEvent) {
    if (this.state?.type !== "paintWallCell") return; // PointerOver event has no effect on other states

    const cellPos = getCellPosFromComposedPath(e.composedPath());

    if (cellPos === null) return;

    if (comparCellPos(cellPos, this.state.currentlyOverCell)) {
      return; // we are still over the same cell
    }

    if (
      comparCellPos(this.state.startedFrom, this.state.currentlyOverCell) &&
      !comparCellPos(this.state.startedFrom, cellPos)
    ) {
      const state = this.state;

      this.setGridStateRef.current((gridState) => {
        setCellType(gridState, state.startedFrom, "wallCellState");
      });
    }

    this.state.currentlyOverCell = cellPos;

    if (!this.state.passedThrough[convertCellPosToString(cellPos)]) {
      this.setGridStateRef.current((gridState) => {
        setCellType(gridState, cellPos, "wallCellState");
      });

      this.state.passedThrough[convertCellPosToString(cellPos)] = true;
    }
  }

  dispatchPointerCancel(e: PointerEvent) {
    this.state = null;
  }

}

const getCellPosFromComposedPath = (path: EventTarget[]): CellPos | null => {
  for (const ele of path) {
    if (ele instanceof HTMLElement) {
      if (
        ele.hasAttribute("data-column-pos") &&
        ele.hasAttribute("data-row-pos")
      ) {
        const columnNum = ele.getAttribute("data-column-pos");
        const rowNum = ele.getAttribute("data-row-pos");

        if (columnNum === null || rowNum === null) {
          throw Error("Unreachable code");
        }

        return { row: parseInt(rowNum, 10), column: parseInt(columnNum, 10) };
      }
    }
  }
  return null;
};

export const cellGotClicked = (
  pos: CellPos,
  gridState: GridState,
  setGridState: Updater<GridState>
) => {
  return () => {
    if (isOnClickHandled) {
      isOnClickHandled = false;

      return; // don't do anything if the event is already handled
    }

    if (gridState.cells[pos.row][pos.column].type !== "defaultCellState") {
      // If clicked cell is anything other then default cell then we will set it to default
      setGridState((prevState) => {
        setCellType(prevState, pos, "defaultCellState");
      });
    }
    // New cell is clicked
    else if (gridState.onClick === "setStartCell") {
      setGridState((prevState) => {
        setCellType(prevState, pos, "startCellState");
      });
    } else if (gridState.onClick === "setTargetCell") {
      setGridState((gridState) => {
        setCellType(gridState, pos, "targetCellState");
      });
    } else if (gridState.onClick === "setWallCell") {
      setGridState((gridState) => {
        setCellType(gridState, pos, "wallCellState");
      });
    } else if (gridState.onClick === null) {
      return;
    } else {
      throw Error("Add more cases");
    }
  };
};
