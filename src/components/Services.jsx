// src/components/Services.jsx
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useInView } from "framer-motion";
import StartProjectModal from "./StartProjectModal";
import Lottie from "lottie-react";

/* ---------- Lottie assets ---------- */
import animDev from "../assets/lottie/dev.json";
import animEcom from "../assets/lottie/ecommerce.json";
import animAI from "../assets/lottie/ai.json";
import animSecurity from "../assets/lottie/security.json";
import animDevOps from "../assets/lottie/devops.json";
// import animNoCode from "../assets/lottie/nocode.json";
// import animProptech from "../assets/lottie/proptech.json";

/* Map key -> animation */
const LOTTIES = {
  dev: animDev,
  ecommerce: animEcom,
  ai: animAI,
  security: animSecurity,
  devops: animDevOps,
  // nocode: animNoCode,
  // proptech: animProptech,
};

/* ---------- data ---------- */
const services = [
 {
  title: "Web & App Development",
  lottie: "dev",
  blurb:
    "High-performing apps and portals—built fast, polished to feel premium, and ready to scale from first launch to full market.",
  points: [
    "MVP to market in weeks",
    "Conversion-focused UX & accessibility",
    "Secure by design (auth, permissions, audits)",
    "Offline-ready & responsive across devices",
  ],
  // optional: replace 'stack' with proof points instead of tech names
  stack: ["Time-to-value", "Reliability SLAs", "Analytics & insights", "SEO & performance"],
},

  {
    title: "E-commerce & Payments",
    lottie: "ecommerce",
    blurb:
      "Marketplaces that convert: product discovery, checkout flows, analytics, and regional payments.",
    points: ["Multi-vendor", "Recommendations", "SEO", "Analytics"],
    stack: ["Stripe", "M-Pesa", "PayPal", "GA4"],
  },
  {
    title: "AI, Data & Analytics",
    lottie: "ai",
    blurb:
      "Practical AI for growth — from chatbots to insights. We ship models, pipelines, and clear dashboards.",
    points: ["Chatbots/Assistants", "Recommenders", "ETL/ELT", "BI Dashboards"],
    stack: ["Python", "R", "Ollama", "Rasa"],
  },
  {
    title: "Cybersecurity",
    lottie: "security",
    blurb:
      "Harden your stack. We audit, instrument, and monitor to reduce risk and meet best practices.",
    points: ["AppSec", "SIEM/Logging", "Vuln Scans", "Incident Playbooks"],
    stack: ["Wazuh", "Fail2ban", "OWASP", "TLS"],
  },
  {
    title: "Cloud & DevOps",
    lottie: "devops",
    blurb:
      "Reliable deployments on AWS. Containers, CI/CD, scaling, and performance tuning baked in.",
    points: ["Docker", "CI/CD", "Observability", "Cost Control"],
    stack: ["AWS EC2", "Nginx/Apache", "GitHub Actions", "Docker"],
  },
  {
    title: "No-Code & Automation",
    lottie: "nocode",
    blurb:
      "Automate the busywork and streamline operations—forms, workflows, and internal tools that save hours, not just clicks.",
    points: [
      "Internal tools your team actually uses",
      "Back-office automation & approvals",
      "Seamless data sync across systems",
      "Trigger-based workflows & alerts",
    ],
    // swap 'stack' for credibility signals instead of tool names
    stack: ["Faster cycle times", "Fewer manual errors", "Lower ops cost", "Audit-friendly logs"],
  },
  {
    title: "PropTech Solutions",
    lottie: "proptech",
    blurb:
      "Real-estate tech (like KiraEstate): map search, agent portals, listings, and lead pipelines.",
    points: ["Map Search", "Agent CRM", "Favorites", "Nearby Places"],
    stack: ["Google Maps", "PostgreSQL", "Tailwind", "Redis"],
  },
];

/* ---------- motion presets ---------- */
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };
const leftVariant  = { hidden: { opacity: 0, x: -60, scale: 0.98 }, show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45 } } };
const rightVariant = { hidden: { opacity: 0, x:  60, scale: 0.98 }, show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45 } } };

const mobileContainer = { hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const mobileZoom = { hidden: { opacity: 0, scale: 0.96, y: 8 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.30, ease: "easeOut" } } };

/* ---------- mobile detection ---------- */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(q.matches);
    update();
    q.addEventListener?.("change", update);
    return () => q.removeEventListener?.("change", update);
  }, []);
  return isMobile;
}

/* ---------- atoms ---------- */
function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] text-amber-100 bg-amber-300/10 backdrop-blur-md shadow-[0_8px_20px_-12px_rgba(251,191,36,0.45)]">
      {children}
    </span>
  );
}

const ctaPrimary =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black " +
  "bg-gradient-to-b from-amber-300 via-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 " +
  "shadow-[0_12px_28px_-12px_rgba(251,191,36,0.65)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70";

const ctaGlass =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white " +
  "bg-white/10 hover:bg-white/15 backdrop-blur-md transition shadow-[0_12px_28px_-16px_rgba(0,0,0,0.6)]";

/* ---------- Lottie helpers ---------- */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;
    const onChange = () => setReduce(!!mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduce;
}

function LottieIcon({ name, size = 180, className = "" }) {
  const reduce = usePrefersReducedMotion();
  const data = LOTTIES[name];
  if (!data) {
    return (
      <div
        className={`rounded-2xl bg-white/8 backdrop-blur-md ${className}`}
        style={{ width: size, height: size, boxShadow: "0 16px 60px -22px rgba(0,0,0,0.6)" }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ width: size, height: size }}>
      <Lottie animationData={data} autoplay={!reduce} loop={!reduce} style={{ width: "100%", height: "100%" }} aria-hidden="true" />
    </div>
  );
}

/* ---------- background stars ---------- */
const SHOOTERS_DESKTOP = [
  { top: "12%", left: "8%",  delay: "0s",   dur: "6s" },
  { top: "28%", left: "18%", delay: "1.2s", dur: "7s" },
  { top: "40%", left: "5%",  delay: "2.1s", dur: "6.5s" },
  { top: "58%", left: "12%", delay: "3.4s", dur: "7.5s" },
  { top: "22%", left: "70%", delay: "0.8s", dur: "6.2s" },
  { top: "68%", left: "62%", delay: "2.8s", dur: "7.2s" },
  { top: "76%", left: "30%", delay: "1.9s", dur: "6.8s" },
  { top: "14%", left: "46%", delay: "3.1s", dur: "7.8s" },
];
const SHOOTERS_MOBILE = [
  { top: "18%", left: "12%", delay: "0s",   dur: "6.5s" },
  { top: "52%", left: "28%", delay: "1.6s", dur: "7.2s" },
  { top: "30%", left: "72%", delay: "0.9s", dur: "6.8s" },
];

/* ---------- Portal wrapper to avoid overflow clipping ---------- */
function StartProjectPortal({ open, onClose, presetService }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <StartProjectModal open={open} onClose={onClose} presetService={presetService} />,
    document.body
  );
}

/* ---------- Cards (glassy + warm gradient borders) ---------- */
function MobileCard({ s, openModal }) {
  return (
    <motion.div
      variants={mobileZoom}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        e.currentTarget.style.setProperty("--mx", `${x}px`);
        e.currentTarget.style.setProperty("--my", `${y}px`);
      }}
    >
      {/* Warm gradient border frame */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#f5deb3]/2 via-[#caa46c]/25 to-[#f5deb3]/2 shadow-[0_12px_44px_-16px_rgba(255,215,150,0.35)]">
        {/* Glass card */}
        <div className="relative rounded-xl p-5 bg-white/6 backdrop-blur-xl shadow-[0_18px_70px_-22px_rgba(0,0,0,0.6)] ring-1 ring-[#f5deb3]/20">
          {/* hover glow following cursor */}
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
            style={{
              background:
                "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(255,215,150,0.16), transparent 45%)",
            }}
          />
          <div className="relative">
            <h3 className="text-base font-semibold text-amber-50 mb-2">{s.title}</h3>

            <div className="grid grid-cols-[1fr,120px] items-start gap-4">
              <div>
                <p className="text-sm text-white/85">{s.blurb}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-white/90">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.stack.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
                <div className="mt-5 flex gap-3">
                  <button onClick={() => openModal(s.title)} className={ctaPrimary}>
                    Start a project
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <a href="#process" className={ctaGlass}>
                    Our process
                  </a>
                </div>
              </div>

              <div className="flex justify-center">
                <LottieIcon name={s.lottie} size={120} className="md:hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMPORTANT: overlay no longer captures taps */}
      <div className="absolute inset-0 pointer-events-none" />
    </motion.div>
  );
}

function DesktopCard({ s, openModal, side }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2 });

  // cursor-follow glow on the frame
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  return (
    <motion.div
      ref={ref}
      variants={side === "left" ? leftVariant : rightVariant}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {/* Warm golden gradient border frame (updated) */}
      <div
        onMouseMove={onMove}
        className="group relative rounded-2xl p-[1px]
                   bg-gradient-to-br from-[#f5deb3]/7 via-[#caa46c]/25 to-[#f5deb3]/7
                   shadow-[0_12px_44px_-16px_rgba(255,215,150,0.35)]"
      >
        {/* inner glow that follows cursor */}
        <span
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
          style={{
            background:
              "radial-gradient(520px 200px at var(--mx,50%) var(--my,50%), rgba(255,215,150,0.14), transparent 55%)",
          }}
        />

        {/* Glass card */}
        <div className="relative rounded-2xl p-6 bg-white/6 backdrop-blur-xl ring-1 ring-[#f5deb3]/20">
          <h3 className="text-lg md:text-xl font-semibold text-amber-50">{s.title}</h3>
          <p className="text-sm text-white/85 mt-1.5">{s.blurb}</p>
          <ul className="mt-4 space-y-2 text-sm text-white/90">
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-300/90 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {s.stack.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => openModal(s.title)} className={ctaPrimary}>
              Start a project
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a href="#process" className={ctaGlass}>
              Our process
            </a>
          </div>
        </div>

        {/* subtle top-left sweep */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(600px 140px at 20% -20%, rgba(255,255,255,0.12), transparent 60%)" }}
        />
      </div>
    </motion.div>
  );
}

/* ---------- Desktop row ---------- */
function DesktopRow({ s, idx, openModal }) {
  const cardOnLeft = idx % 2 === 0;

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-6 items-stretch">
        {/* Card half */}
        <div className={cardOnLeft ? "md:pr-12" : "order-2 md:pl-12"}>
          <DesktopCard s={s} openModal={openModal} side={cardOnLeft ? "left" : "right"} />
        </div>

        {/* Opposite big Lottie half */}
        <div className={cardOnLeft ? "hidden md:flex items-center md:pl-12 justify-start" : "hidden md:flex items-center md:pr-12 justify-end"}>
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none select-none drop-shadow-xl xl:scale-110"
          >
            <LottieIcon name={s.lottie} size={280} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Component (modal owned here + PORTAL) ---------- */
export default function Services() {
  const isMobile = useIsMobile();

  // Local modal state (works on all breakpoints)
  const [modalOpen, setModalOpen] = useState(false);
  const [presetService, setPresetService] = useState("");

  const openModal = (serviceTitle = "") => {
    setPresetService(serviceTitle || "Discovery Call");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <>
      {/* MOBILE */}
      {isMobile ? (
        <section id="services" className="relative py-16 bg-[#0a0a0b] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(251,191,36,0.16),transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(56,189,248,0.35) 1px, transparent 1px), radial-gradient(rgba(16,185,129,0.55) 1px, transparent 1px)",
                backgroundSize: "12px 12px, 28px 28px",
                backgroundPosition: "0 0, 9px 9px",
                animation: "dot-drift 30s linear infinite",
              }}
            />
            <div className="absolute inset-0 pointer-events-none">
              {SHOOTERS_MOBILE.map((s, i) => (
                <span key={i} className="shooting-star" style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.dur }}>
                  <i />
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-center text-3xl font-extrabold tracking-tight mb-3">
              <span className="bg-gradient-to-r from-amber-200 via-amber-50 to-white bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-center text-white/80 max-w-2xl mx-auto mb-8 text-sm">
              End-to-end delivery from idea to launch: strategy, build, and growth — optimized for Africa &amp; US markets.
            </p>

            <motion.div className="grid grid-cols-1 gap-6" variants={mobileContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              {services.map((s) => (
                <MobileCard key={s.title} s={s} openModal={openModal} />
              ))}
            </motion.div>

            <motion.div
              className="mt-10 rounded-2xl bg-white/6 backdrop-blur-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_18px_70px_-22px_rgba(0,0,0,0.6)] ring-1 ring-[#f5deb3]/20"
              variants={mobileZoom}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
            >
              <div className="text-white text-sm">
                <div className="text-base font-semibold">Have a brief or an idea?</div>
                <div className="text-white/80 text-xs">We’ll scope it in 48 hours and propose the fastest path to value.</div>
              </div>
              <button type="button" onClick={() => openModal("Discovery Call")} className={ctaPrimary}>
                Book a discovery call
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>
          </div>

          <style>{`
            @keyframes dot-drift { 0% { background-position: 0 0, 9px 9px; } 100% { background-position: 20px 20px, 29px 29px; } }
            @keyframes shoot { 0% { transform: translate3d(0,0,0) rotate(-22deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate3d(360px,-160px,0) rotate(-22deg); opacity: 0; } }
            .shooting-star { position: absolute; width: 120px; height: 2px; background: linear-gradient(90deg, rgba(251,191,36,0.95), rgba(251,191,36,0.45), rgba(251,191,36,0)); filter: drop-shadow(0 0 5px rgba(251,191,36,0.6)); transform: rotate(-22deg); animation: shoot linear infinite; opacity: 0.9; }
            .shooting-star i { position: absolute; right: 0; top: -3px; width: 8px; height: 8px; border-radius: 9999px; background: white; box-shadow: 0 0 10px rgba(255,255,255,0.85), 0 0 20px rgba(251,191,36,0.6); }
          `}</style>
        </section>
      ) : (
        /* DESKTOP/TABLET */
        <section id="services" className="relative py-24 bg-[#0a0a0b] isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(251,191,36,0.16),transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(251,191,36,0.35) 1px, transparent 1px), radial-gradient(rgba(16,185,129,0.45) 1px, transparent 1px)",
                backgroundSize: "12px 12px, 28px 28px",
                backgroundPosition: "0 0, 9px 9px",
                animation: "dot-drift 30s linear infinite",
              }}
            />
            <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-amber-400/25" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-emerald-500/20" />
            <div className="absolute inset-0 pointer-events-none">
              {SHOOTERS_DESKTOP.map((s, i) => (
                <span key={i} className="shooting-star" style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.dur }}>
                  <i />
                </span>
              ))}
            </div>
          </div>

          <motion.div className="max-w-6xl mx-auto px-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 className="text-center text-5xl font-extrabold tracking-tight mb-4" variants={item}>
              <span className="bg-gradient-to-r from-amber-200 via-amber-50 to-white bg-clip-text text-transparent">Services</span>
            </motion.h2>

            <motion.p className="text-center text-white/80 max-w-2xl mx-auto mb-12" variants={item}>
              End-to-end delivery from idea to launch: strategy, build, and growth — optimized for Africa &amp; US markets.
            </motion.p>

            <div className="relative">
              {/* center line with warm gradient */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-amber-300/40 via-emerald-300/30 to-transparent" />

              {/* rows with card + opposite big lottie */}
              <div className="flex flex-col gap-16 relative z-10">
                {services.map((s, idx) => (
                  <DesktopRow key={s.title} s={s} idx={idx} openModal={openModal} />
                ))}
              </div>
            </div>

            <motion.div className="mt-14 rounded-2xl bg-white/6 backdrop-blur-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_18px_70px_-22px_rgba(0,0,0,0.6)] ring-1 ring-[#f5deb3]/20" variants={item}>
              <div className="text-white">
                <div className="text-lg font-semibold">Have a brief or an idea?</div>
                <div className="text-white/80 text-sm">We’ll scope it in 48 hours and propose the fastest path to value.</div>
              </div>
              <button type="button" onClick={() => openModal("Discovery Call")} className={ctaPrimary}>
                Book a discovery call
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>
          </motion.div>

          <style>{`
            @keyframes dot-drift { 0% { background-position: 0 0, 9px 9px; } 100% { background-position: 20px 20px, 29px 29px; } }
            @keyframes shoot { 0% { transform: translate3d(0,0,0) rotate(-22deg); opacity: 0; } 8% { opacity: 1; } 100% { transform: translate3d(620px,-220px,0) rotate(-22deg); opacity: 0; } }
            .shooting-star { position: absolute; width: 160px; height: 2px; background: linear-gradient(90deg, rgba(251,191,36,0.95), rgba(251,191,36,0.45), rgba(251,191,36,0)); filter: drop-shadow(0 0 6px rgba(251,191,36,0.7)); transform: rotate(-22deg); animation: shoot linear infinite; opacity: 0.95; }
            .shooting-star i { position: absolute; right: 0; top: -3px; width: 8px; height: 8px; border-radius: 9999px; background: white; box-shadow: 0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(251,191,36,0.7); }
          `}</style>
        </section>
      )}

      {/* Portal ensures the modal isn't clipped on mobile */}
      <StartProjectPortal open={modalOpen} onClose={closeModal} presetService={presetService} />
    </>
  );
}
