// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import StartProjectPage from "./pages/StartProjectPage";
import ProjectPayment from "./pages/ProjectPayment"; // ✅ add this
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AdminEnquiries from "./pages/AdminEnquiries"; // ✅ correct import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/start-project" replace />} />

        {/* Main flows */}
        <Route path="/start-project" element={<StartProjectPage />} />
        <Route path="/pay" element={<ProjectPayment />} />

        {/* Stripe return routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Admin */}
        <Route path="/admin/enquiries" element={<AdminEnquiries />} />


        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/start-project" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
