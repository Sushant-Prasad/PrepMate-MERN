import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DSA from "./pages/DSA";
import Login from "./pages/login";
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
        "http://localhost:3001/api/users/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      // ignore errors but console.log for debugging
      console.warn("Logout request failed (proceeding with client-side logout)", err);
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
          {/* Pass user + onLogout to AppLayout so Navbar receives them */}
          <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={<Login onLogin={(u) => setUser(u)} />}
            />
            <Route path="/register" element={<Reg />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/dsa/submit/:id" element={<DSASubmit />} />
            <Route path="/aptitude" element={<Aptitude />} />
            <Route path="/company" element={<CompanyPrep />} />
            <Route path="/rooms" element={<StudyRoom />} />
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
