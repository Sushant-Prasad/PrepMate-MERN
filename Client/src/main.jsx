import React from "react";
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

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* All pages share the Navbar via AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Reg />} />
            <Route path="/dsa" element={<DSA />} /> 
            <Route path="/dsa/submit/:id" element={<DSASubmit />} />
            <Route path="/aptitude" element={<Aptitude />} /> 
            <Route path="/company" element={<CompanyPrep />} /> 
            <Route path="/rooms" element={<StudyRoom />} /> 
          </Route>

          {/* 404 fallback (no navbar, optional) */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
