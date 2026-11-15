import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import App from "./App";
import "./styles/index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container #root was not found in index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
