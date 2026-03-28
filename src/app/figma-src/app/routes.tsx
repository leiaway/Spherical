import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { NowPlaying } from "./components/NowPlaying";
import { DiscoveryDashboard } from "./components/DiscoveryDashboard";
import { AlgorithmSettings } from "./components/AlgorithmSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: NowPlaying },
      { path: "discovery", Component: DiscoveryDashboard },
      { path: "settings", Component: AlgorithmSettings },
    ],
  },
]);
