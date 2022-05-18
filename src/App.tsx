import { Grid } from "./components/grid";
import { Tutorial } from "./components/tutorial";
import { getGridDemensions, getViewportDimension } from "./gridHelpers";

export const App = () => {
  const { height, width } = getViewportDimension();
  const gridDimensions = getGridDemensions({ width, height });

  return (
    <div className="mx-2 my-2">
      <Tutorial />
      <Grid column={gridDimensions.columns} row={gridDimensions.rows} />
    </div>
  );
};
