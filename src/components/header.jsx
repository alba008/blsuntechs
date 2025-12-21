// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import StartProjectModal from "./StartProjectModal";

// Keep nav lean + client-facing (anchors for homepage sections)
const LINKS = [
  { href: "#about", label: "About", type: "anchor" },
  { href: "#projects", label: "Work", type: "anchor" },
  { href: "#contact", label: "Contact", type: "anchor" },
];

function isAnchor(href) {
  return typeof href === "string" && href.startsWith("#");
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const drawerRef = useRef(null);
  const location = useLocation();

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const closeDrawer = () => setDrawerOpen(false);

  const openStart = () => {
    setStartOpen(true);
    setDrawerOpen(false);
  };
  const closeStart = () => setStartOpen(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ESC closes drawer
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
    const shouldLock = drawerOpen || startOpen;
    const prev = document.body.style.overflow;
    if (shouldLock) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, startOpen]);

  const NavItem = ({ href, label, onClick, mobile = false }) => {
    // ✅ More contrast on mobile for visibility
    const base = mobile
      ? "px-3 py-3 rounded-xl text-[15px] font-semibold " +
        "text-amber-50/95 bg-white/0 hover:bg-white/6 active:bg-white/10 " +
        "border border-white/0 hover:border-amber-300/20 transition " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
      : "px-3 py-2 rounded-md text-sm md:text-[15px] " +
        "text-amber-100/85 hover:text-amber-50 " +
        "hover:bg-amber-300/10 transition " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60";

    if (isAnchor(href)) {
      return (
        <a href={href} onClick={onClick} className={base}>
          {label}
        </a>
      );
    }

    return (
      <Link to={href} onClick={onClick} className={base}>
        {label}
      </Link>
    );
  };

  const NavLinks = ({ onClick, mobile = false }) => (
    <>
      {LINKS.map((l) => (
        <NavItem
          key={l.href}
          href={l.href}
          label={l.label}
          onClick={onClick}
          mobile={mobile}
        />
      ))}
    </>
  );

  return (
    <>
      <header
        className="
          sticky top-0 z-[60] border-b
          border-amber-300/15
          bg-[#0b0b0c]/80
          backdrop-blur supports-[backdrop-filter]:backdrop-blur
          shadow-[0_1px_0_0_rgba(251,191,36,0.12),0_10px_30px_-12px_rgba(0,0,0,0.6)]
        "
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div
                className="h-8 w-8 rounded-lg
                           bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500
                           shadow-[0_0_0_2px_rgba(251,191,36,0.22),0_10px_24px_-10px_rgba(251,191,36,0.35)]
                           group-hover:scale-[1.03] transition"
              />
              <span
                className="text-lg sm:text-xl font-bold tracking-tight
                           bg-gradient-to-r from-amber-50 via-amber-200 to-amber-400
                           bg-clip-text text-transparent"
              >
                BlsunTech
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />

              <button
                type="button"
                onClick={openStart}
                className="ml-2 inline-flex items-center gap-1.5 rounded-full
                           bg-amber-400/95 px-3 py-1.5 text-sm font-semibold text-black
                           hover:bg-amber-300 transition
                           ring-1 ring-amber-300/70
                           shadow-[0_10px_24px_-14px_rgba(251,191,36,0.6)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Start Project <ChevronDown size={16} />
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={toggleDrawer}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              aria-label="Open menu"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2
                         text-amber-100/95 hover:text-amber-50 hover:bg-amber-300/12
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            >
              {drawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ✅ Darker overlay so drawer stands out more */}
        <div
          className={`fixed inset-0 z-[70] bg-black/80 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeDrawer}
        />

        {/* ✅ Side drawer: more opaque background, clearer separation */}
        <aside
          id="mobile-drawer"
          ref={drawerRef}
          className={`fixed inset-y-0 right-0 z-[80] w-[84%] max-w-sm transform
                      bg-[#0b0b0c]/98
                      border-l border-amber-300/25
                      shadow-[0_20px_80px_rgba(0,0,0,0.85)]
                      transition-transform duration-200 md:hidden ${
                        drawerOpen ? "translate-x-0" : "translate-x-full"
                      }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-300/15">
            <div className="inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 shadow-[0_0_0_2px_rgba(251,191,36,0.22)]" />
              <span className="text-amber-50 font-semibold">Menu</span>
            </div>
            <button
              onClick={closeDrawer}
              aria-label="Close menu"
              className="rounded-md p-2 text-amber-100/95 hover:text-amber-50 hover:bg-amber-300/12
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer body */}
          <nav className="px-3 py-4">
            {/* ✅ Add a subtle panel behind links for better visibility */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
              <div className="flex flex-col">
                <NavLinks onClick={closeDrawer} mobile />

                <button
                  type="button"
                  onClick={openStart}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl
                             bg-amber-400 px-3 py-2.5 text-[15px] font-extrabold text-black
                             hover:bg-amber-300 transition
                             ring-1 ring-amber-300/80 shadow-[0_18px_40px_-22px_rgba(251,191,36,0.9)]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Start Project
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-amber-300/15 pt-4 text-[12px] text-amber-200/75">
              © {new Date().getFullYear()} BlsunTech • All rights reserved
            </div>
          </nav>
        </aside>
      </header>

      {/* Modal portal */}
      {startOpen &&
        createPortal(<StartProjectModal open={startOpen} onClose={closeStart} />, document.body)}
    </>
  );
}
