import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-0xrld0sjyuhye82d.us.auth0.com"
      clientId="5HniVNPbu3FG8pQzq49agyz13275WqAO"
      authorizationParams={{
        redirect_uri: "https://miracle-of-luck.vercel.app",
      }}
      audience="http://localhost:8000"
      scope="openid profile email"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
