import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import MapPage from "./components/MapPage";
import TrendsPage from "./components/TrendsPage";
import SavedPage from "./components/SavedPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: MapPage },
      { path: "trends", Component: TrendsPage },
      { path: "saved", Component: SavedPage },
    ],
  },
]);
