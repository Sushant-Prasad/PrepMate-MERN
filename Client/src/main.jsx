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
// import StudyRoom from "./pages/StudyRoom";
import Chat from "./pages/Chat"
import CompanyPrep from "./pages/CompanyPrep";
import DSASubmit from "./components/DSASubmit";
import axios from "axios";
import AptiStreak from "./pages/AptiStreak";
import DSAStreak from "./pages/DSAStreak";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminDSA from "./pages/Admin/AdminDSA";
import AdminAptitude from "./pages/Admin/AdminAptitude";


import { ChatProvider } from "./context/ChatContext";



const queryClient = new QueryClient();

function Root() {
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("Logout request failed", err);
    } finally {
      localStorage.removeItem("user"); // optional
      navigate("/login", { replace: true });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout onLogout={handleLogout} />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Reg />} />
              <Route path="dsa" element={<DSA />} />
              <Route path="dsa/submit/:id" element={<DSASubmit />} />
              <Route path="aptitude" element={<Aptitude />} />
              <Route path="company" element={<CompanyPrep />} />
              <Route path="rooms" element={<Chat />} />
              <Route path="aptitude-streak" element={<AptiStreak />} />
              <Route path="dsa-streak" element={<DSAStreak />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="dsa-questions" element={<AdminDSA />} />
              <Route path="aptitude-questions" element={<AdminAptitude />} />
            </Route>

            <Route path="*" element={<Error />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
