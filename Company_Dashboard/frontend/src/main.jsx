import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // ✅ Add Router here
import App from "./App.jsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      {" "}
      {/* ✅ Wrap App in Router only here */}
      <App />
    </Router>
  </React.StrictMode>
);
