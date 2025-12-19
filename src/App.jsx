import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectPayment from "./pages/ProjectPayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pay" element={<ProjectPayment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
}
