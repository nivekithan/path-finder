import React, { MutableRefObject } from "react";
import { Updater } from "use-immer";
import { comparCellPos } from "./cellHelpers";
import { CellPos } from "./components/cell";
import { GridState } from "./components/grid";
import { computeNextOnlick, setCellType } from "./gridHelpers";

type EventIdentifierState =
  | {
      type: "pressedDownOnStartCell";
      startCell: CellPos;
    }
  | { type: "pressedDownOnTargetCell"; targetCell: CellPos }
  | null;

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

  subscribeToEvents() {
    window.addEventListener("pointerdown", this.handleNativePointerDownEvent);
    window.addEventListener("pointerup", this.handleNativePointerUpEvent);
    window.addEventListener(
      "pointercancel",
      this.handleNativePointerCancelEvent
    );
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
  }

  dispatchPointerDown(e: PointerEvent) {
    const cellPos = getCellPosFromComposedPath(e.composedPath());

    if (cellPos === null) return;

    this.originalPressedOnCell = cellPos;

    if (
      this.gridStateRef.current.startCell &&
      comparCellPos(cellPos, this.gridStateRef.current.startCell)
    ) {
      this.state = { type: "pressedDownOnStartCell", startCell: cellPos };
    } else if (
      this.gridStateRef.current.targetCell &&
      comparCellPos(cellPos, this.gridStateRef.current.targetCell)
    ) {
      this.state = { type: "pressedDownOnTargetCell", targetCell: cellPos };
    } else {
    }
  }

  dispatchPointerUp(e: PointerEvent) {
    const cellPos = getCellPosFromComposedPath(e.composedPath());

    if (cellPos === null) {
      this.state = null;
      return;
    }

    if (
      this.originalPressedOnCell
        ? comparCellPos(this.originalPressedOnCell, cellPos)
        : false
    ) {
      this.state = null;
      return; // this is a click event which is handled by the cell itself
    }

    if (this.state?.type === "pressedDownOnStartCell") {
      const state = this.state;

      if (!comparCellPos(state.startCell, cellPos)) {
        this.setGridStateRef.current((gridState) => {
          setCellType(gridState, cellPos, { type: "startCellState" });
        });
      } else {
        // Should not be possible
        throw Error("Unreachable code");
      }
    } else if (this.state?.type === "pressedDownOnTargetCell") {
      const state = this.state;

      if (!comparCellPos(state.targetCell, cellPos)) {
        this.setGridStateRef.current((gridState) => {
          setCellType(gridState, cellPos, { type: "targetCellState" });
        });
      } else {
        // Should not be possible
        throw Error("Unreachable code");
      }
    }
    this.state = null;
  }

  dispatchPointerCancel(e: PointerEvent) {
    this.state = null;
  }

  dispatchPointerOut(e: PointerEvent) {}

  dispatchPointerLeave() {}
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
