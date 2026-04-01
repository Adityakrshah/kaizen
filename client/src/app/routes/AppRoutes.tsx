import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import MockTestResult from "@/pages/MockTestResult";
import {Login }from "@/pages/Login"; // Make sure to import your Login page

export function AppRoutes() {
  return (
    <Routes>
      {/* Protect these routes with the AppLayout shell */}
      <Route element={<AppLayout />}>
        {/* Redirect base path to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 🚀 THE NEW RESULT ROUTE */}
        <Route path="/mocktest/result/:id" element={<MockTestResult />} />
        
        {/* Add other module routes here as you build them */}
      </Route>

      {/* Pages without sidebar (Authentication) */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}