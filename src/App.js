// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import StartProjectPage from "./pages/StartProjectPage";
import ProjectPayment from "./pages/ProjectPayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AdminEnquiries from "./pages/AdminEnquiries";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
console.log({ Home, StartProjectPage, ProjectPayment, PaymentSuccess, PaymentCancel, AdminEnquiries });

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Home landing page */}
        <Route path="/" element={<Home />} />

        {/* ✅ Main flows */}
        <Route path="/start-project" element={<StartProjectPage />} />
        <Route path="/pay" element={<ProjectPayment />} />

        {/* ✅ Payment outcomes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* ✅ Admin */}
        <Route path="/admin/enquiries" element={<AdminEnquiries />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />


        {/* ✅ Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    
  );
}
