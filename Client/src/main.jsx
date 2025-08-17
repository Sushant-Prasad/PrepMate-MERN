import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DSA from './pages/DSA';
import Login from './pages/login';
import Reg from './pages/Reg';
import Error from "./pages/Error"
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}> 
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Home page is Todo */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Reg />} />
          <Route path="/DSA" element={<DSA />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
