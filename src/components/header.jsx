// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import StockTicker from "./StockTicker";
import StartProjectModal from "./StartProjectModal";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const drawerRef = useRef(null);

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const closeDrawer = () => setDrawerOpen(false);

  const openStartModal = () => {
    setModalOpen(true);
    setDrawerOpen(false);
  };
  const closeStartModal = () => setModalOpen(false);

  // ESC to close drawer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    if (drawerOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // click outside drawer to close
  useEffect(() => {
    const onDown = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [drawerOpen]);

  // lock body scroll when drawer OR modal is open
  useEffect(() => {
    const shouldLock = drawerOpen || modalOpen;
    const prev = document.body.style.overflow;
    if (shouldLock) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, modalOpen]);

  const NavLinks = ({ onClick }) => (
    <>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          onClick={onClick}
          className="px-3 py-2 rounded-md text-sm md:text-[15px]
                     text-amber-100/90 hover:text-amber-50
                     hover:bg-amber-300/10 transition
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          {l.label}
        </a>
      ))}
    </>
  );

  return (
    <>
      <header
        className="
          sticky top-0 z-[60] border-b
          border-amber-300/20
          bg-[radial-gradient(1200px_200px_at_50%_-80px,rgba(251,191,36,0.14),transparent)]
          bg-[#0b0b0c]/75
          backdrop-blur supports-[backdrop-filter]:backdrop-blur
          shadow-[0_1px_0_0_rgba(251,191,36,0.15),0_10px_30px_-10px_rgba(251,191,36,0.15)]
        "
      >
        {/* Optional: give the ticker a soft gold edge */}
        <div className="border-b border-amber-300/10 bg-black/20">
          <StockTicker />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <a href="/" className="inline-flex items-center gap-2 group">
              {/* Logo chip with warm gradient + subtle glow */}
              <div
                className="h-8 w-8 rounded-lg
                           bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500
                           shadow-[0_0_0_2px_rgba(251,191,36,0.25),0_8px_20px_-6px_rgba(251,191,36,0.35)]
                           group-hover:scale-[1.03] transition"
              />
              <span
                className="text-lg sm:text-xl font-bold tracking-tight
                           bg-gradient-to-r from-amber-50 via-amber-200 to-amber-400
                           bg-clip-text text-transparent"
              >
                BlsunTech
              </span>
            </a>

            {/* desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
              <button
                type="button"
                onClick={openStartModal}
                className="ml-2 inline-flex items-center gap-1.5 rounded-full
                           bg-amber-400/95 px-3 py-1.5 text-sm font-semibold text-black
                           hover:bg-amber-300 transition
                           ring-1 ring-amber-300/70 shadow-[0_6px_20px_-6px_rgba(251,191,36,0.55)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Start Project <ChevronDown size={16} />
              </button>
            </nav>

            {/* mobile trigger */}
            <button
              onClick={toggleDrawer}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              aria-label="Open menu"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2
                         text-amber-100/90 hover:text-amber-50 hover:bg-amber-700/01
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            >
              {drawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* overlay for drawer */}
        <div
          className={`fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeDrawer}
        />

        {/* side drawer */}
        <aside
          id="mobile-drawer"
          ref={drawerRef}
          className={`fixed inset-y-0 right-0 z-[80] w-[80%] max-w-sm transform
                      bg-gradient-to-b from-[#0b0b0c] to-[#111012]
                      border-l border-amber-300/15 shadow-2xl
                      transition-transform duration-200 md:hidden ${
                        drawerOpen ? "translate-x-0" : "translate-x-full"
                      }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-300/15">
            <div className="inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 shadow-[0_0_0_2px_rgba(251,191,36,0.2)]" />
              <span className="text-amber-50 font-semibold">Menu</span>
            </div>
            <button
              onClick={closeDrawer}
              aria-label="Close menu"
              className="rounded-md p-2 text-amber-100/90 hover:text-amber-50 hover:bg-amber-300/10
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="px-3 py-4">
            <div className="flex flex-col">
              <NavLinks onClick={closeDrawer} />
              <button
                type="button"
                onClick={openStartModal}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg
                           bg-amber-400/95 px-3 py-2 text-sm font-semibold text-black
                           hover:bg-amber-300 transition
                           ring-1 ring-amber-300/70 shadow-[0_10px_24px_-10px_rgba(251,191,36,0.6)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Start Project
              </button>
            </div>

            <div className="mt-6 border-t border-amber-300/15 pt-4 text-[12px] text-amber-200/70">
              © {new Date().getFullYear()} BlsunTech • All rights reserved
            </div>
          </nav>
        </aside>
      </header>

      {/* ---- Modal via PORTAL so it sits above LandingHero ---- */}
      {modalOpen &&
        createPortal(
          <StartProjectModal open={modalOpen} onClose={closeStartModal} />,
          document.body
        )}
    </>
  );
}
