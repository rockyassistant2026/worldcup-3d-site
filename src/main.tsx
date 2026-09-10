import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useAppStore } from "./store/useAppStore";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root is missing");
}

// Expose store for E2E testing
if (typeof window !== "undefined") {
  (window as any).__ZUSTAND_STORE__ = useAppStore.getState();
  // Subscribe to updates
  useAppStore.subscribe((state) => {
    (window as any).__ZUSTAND_STORE__ = state;
  });
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
