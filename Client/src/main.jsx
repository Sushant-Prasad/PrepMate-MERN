// src/main.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DSA from "./pages/DSA";
import Login from "./pages/Login";
import Reg from "./pages/Reg";
import Error from "./pages/Error";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./layouts/AppLayout";
import Aptitude from "./pages/Aptitude";
import StudyRoom from "./pages/StudyRoom";
import CompanyPrep from "./pages/CompanyPrep";
import DSASubmit from "./components/DSASubmit";
import axios from "axios";
import AptiStreak from "./pages/AptiStreak";
import DSAStreak from "./pages/DSAStreak";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";

const queryClient = new QueryClient();

function Root() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  // logout handler: clear local state and optionally hit backend logout endpoint
  const handleLogout = async () => {
    try {
      // optional: notify backend to clear HttpOnly cookie/session
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      // ignore errors but console.log for debugging
      console.warn(
        "Logout request failed (proceeding with client-side logout)",
        err
      );
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      // navigate to login page
      window.location.href = "/login";
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* AppLayout wraps the main public/app pages */}
          <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login onLogin={(u) => setUser(u)} />} />
            <Route path="register" element={<Reg />} />
            <Route path="dsa" element={<DSA />} />
            <Route path="dsa/submit/:id" element={<DSASubmit />} />
            <Route path="aptitude" element={<Aptitude />} />
            <Route path="company" element={<CompanyPrep />} />
            <Route path="rooms" element={<StudyRoom />} />
            <Route path="aptitude-streak" element={<AptiStreak />} />
            <Route path="dsa-streak" element={<DSAStreak />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin area - separate layout (does not use AppLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
