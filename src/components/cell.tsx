import React from "react";

export type CellProps = {
  size: number;
  state: CellState;
  cellGotClicked: () => void;
  pos: CellPos;
};

export const Cell = ({
  size,
  state,
  cellGotClicked,
  pos: { column, row },
}: CellProps) => {
  const cssBackgroundStateAnimation =
    state.backgroundState === "found"
      ? "found-cell-animation"
      : state.backgroundState === "visted"
      ? "visited-cell-animation"
      : "";

  const onClick = () => {
    cellGotClicked();
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      style={{ height: size, width: size }}
      className={`outline-1 outline-blue-500 outline flex justify-center items-center ${cssBackgroundStateAnimation}`}
      onClick={onClick}
      data-column-pos={column}
      data-row-pos={row}
      data-state-type={state.type}
      data-background-state={state.backgroundState}
      draggable={false}
      onDragStart={onDragStart}
    >
      {(() => {
        if (state.type === "startCellState") {
          return <Start />;
        } else if (state.type === "targetCellState") {
          return <Target />;
        } else if (state.type === "wallCellState") {
          return <Wall />;
        } else {
          return null;
        }
      })()}
    </div>
  );
};

const Start = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const Target = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-[60%] w-[60%]"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const Wall = () => {
  return <div className="bg-slate-700 w-full h-full animate-wall"></div>;
};

export type CellPos = { row: number; column: number };
export type CellState =
  | StartCellState
  | DefaultCellState
  | TargetCellState
  | WallCellState;

export type TargetCellState = {
  type: "targetCellState";
  backgroundState: "found" | "default";
};
export type StartCellState = {
  type: "startCellState";
  backgroundState: "visted" | "found" | "default";
};
export type DefaultCellState = {
  type: "defaultCellState";
  backgroundState: "visted" | "found" | "default";
};
export type WallCellState = {
  type: "wallCellState";
  backgroundState: "default";
};
