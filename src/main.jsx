import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";

import Router from "./Router";
import { dataStore } from "./Components/services/dataStore";
import { ToastProvider } from "./Components/context/ToastContext";
import { LabelProvider } from "./Components/context/LabelContext";
import { AuthProvider } from "./Components/context/AuthContext";

dataStore.init(); // loads fresh sample JSON when SEED_VERSION changes

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <LabelProvider>
        <AuthProvider>
          <RouterProvider router={Router} />
        </AuthProvider>
      </LabelProvider>
    </ToastProvider>
  </StrictMode>,
);
