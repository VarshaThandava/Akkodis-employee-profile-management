import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
 
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/global.css";
 
import App from "./App";
import { msalConfig } from "./authconfig";
 
const msalInstance = new PublicClientApplication(msalConfig);
 
async function startApp() {
  try {
    await msalInstance.initialize();
 
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MsalProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
}
 
startApp();