import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App2";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles.css";
// bootstrap JS for components (collapse/accordion, tooltips if needed)
import "bootstrap/dist/js/bootstrap.bundle";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
