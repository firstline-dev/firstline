import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles.css";
import { FirstLineApp } from "@/components/firstline/FirstLineApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirstLineApp />
  </StrictMode>,
);
