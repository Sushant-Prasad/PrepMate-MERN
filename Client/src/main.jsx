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
import AppLayout from "./layouts/AppLayout"; // <-- add

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
            <Route path="/dsa" element={<DSA />} /> {/* prefer lowercase path */}
          </Route>

          {/* 404 fallback (no navbar, optional) */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
