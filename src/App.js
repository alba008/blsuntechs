// src/App.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/header";

// Home sections (current homepage components)
import LandingHero from "./components/LandingHero";
import About from "./components/About";
import Services from "./components/Services";
import Projects from "./components/Projects";
import NewsFeed from "./components/NewsFeed";
import Contact from "./components/contact";

// Existing pages
import AdminEnquiries from "./pages/AdminEnquiries";
import StartProjectModal from "./components/StartProjectModal";

// If these pages exist in your project, keep these imports.
// If a file name differs (Aboutpage vs AboutPage), rename the file or adjust the import.
import StartProjectPage from "./pages/StartProjectPage";
import ProjectPayment from "./pages/ProjectPayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import ContactPage from "./pages/Contactpage";
import AboutPage from "./pages/Aboutpage";


/**
 * Home stays as a section-based landing page.
 * We pass onOpenStartProject so buttons can open the global modal.
 */
function Home({ onOpenStartProject }) {
  return (
    <>
      <LandingHero onOpenStartProject={onOpenStartProject} />
      <About />
      <Services />
      <Projects />
      <NewsFeed />
      <Contact onOpenStartProject={onOpenStartProject} />
    </>
  );
}

export default function App() {
  const [startOpen, setStartOpen] = useState(false);
  const [presetService, setPresetService] = useState("");

  const openStart = (serviceName = "") => {
    setPresetService(serviceName);
    setStartOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-indigo-950 text-white">
        {/* Header sits globally on every route */}
        <Header onOpenStartProject={() => openStart()} />

        <main>
          <Routes>
            {/* ✅ Home landing page */}
            <Route path="/" element={<Home onOpenStartProject={() => openStart()} />} />

            {/* ✅ Main flows */}
            <Route
              path="/start-project"
              element={<StartProjectPage onOpenStartProject={() => openStart()} />}
            />
            <Route path="/pay" element={<ProjectPayment />} />

            {/* ✅ Payment outcomes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* ✅ Admin */}
            <Route path="/admin/enquiries" element={<AdminEnquiries />} />

            {/* ✅ Static pages */}
            <Route path="/contact" element={<ContactPage onOpenStartProject={() => openStart()} />} />

            <Route path="/about" element={<AboutPage onOpenStartProject={() => openStart()} />} />


            {/* ✅ Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* ✅ Global modal — can be opened from any page */}
        <StartProjectModal
          open={startOpen}
          onClose={() => setStartOpen(false)}
          presetService={presetService}
        />
      </div>
    </BrowserRouter>
  );
}
