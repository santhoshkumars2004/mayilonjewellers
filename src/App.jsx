import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import {
  Dashboard,
  Sales,
  Purchase,
  Stock,
  Billing,
  Accounts,
  Settings,
  Expenses,
  Dealers
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — no navbar */}
        <Route path="/" element={<LandingPage />} />

        {/* App pages — wrapped in navbar layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/dealers" element={<Dealers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
