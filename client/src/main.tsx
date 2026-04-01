import React from "react"
import "./index.css";
import ReactDOM from "react-dom/client"
import App from "./App"
import { QueryProvider } from "./app/providers/QueryProvider"
// --- ADD THIS IMPORT ---
import { authClient } from "./lib/auth-client" 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      {/* Better Auth needs to wrap your app to manage session state */}
      <App />
    </QueryProvider>
  </React.StrictMode>
)