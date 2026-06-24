import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import LoginSuccess from "./pages/LoginSuccess";
import Dashboard from "./pages/Dashboard"; // 🌟 Renamed cleanly for absolute clarity

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌟 1. Map the root URL to automatically send users to the Login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        {/* Handles incoming Google callback redirect tokens */}
        <Route path="/login-success" element={<LoginSuccess />} />
        
        {/* 🌟 2. Added explicit route paths for both standard logins AND your custom success redirect logic */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;