import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </AuthProvider>,
);
