import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./routes/Home";
import Study from "./routes/Study";
import Browse from "./routes/Browse";
import Favorites from "./routes/Favorites";
import SettingsPage from "./routes/Settings";
import Showcase from "./routes/Showcase";
import "./styles/globals.css";

// Dark mode: follow OS preference via Tailwind "class" strategy
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const applyDark = () => document.documentElement.classList.toggle("dark", mq.matches);
applyDark();
mq.addEventListener("change", applyDark);

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "study", element: <Study /> },
      { path: "browse", element: <Browse /> },
      { path: "favorites", element: <Favorites /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "showcase/:id", element: <Showcase /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
