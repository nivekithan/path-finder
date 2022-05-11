export const CELL_SIZE = 35;

export const getViewportDimension = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return { width, height };
};

export const getGridDemensions = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const columns = Math.floor(width / CELL_SIZE);
  const rows = Math.floor(height / 25);

  return { columns, rows };
};

