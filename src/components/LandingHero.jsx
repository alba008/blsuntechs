// src/components/LandingHero.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import shoppingAnimation from "../assets/lottie/webdev.json";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.06 },
  }),
};

// glossy, myshop-style buttons (shiny, glassy, golden)
const btnPrimary =
  "relative group inline-flex items-center justify-center rounded-full px-7 py-3 font-semibold text-black " +
  "bg-gradient-to-b from-amber-300 via-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 " +
  "shadow-[0_12px_28px_-12px_rgba(251,191,36,0.65)] " +
  "before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.55),transparent_60%)] before:opacity-60 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70";

const btnGlass =
  "relative group inline-flex items-center justify-center rounded-full px-7 py-3 text-white " +
  "bg-white/10 hover:bg-white/15 backdrop-blur-md " +
  "shadow-[0_12px_28px_-16px_rgba(0,0,0,0.65)] " +
  "before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.45),transparent_62%)] before:opacity-50 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30";

export default function LandingHero() {
  const glowRef = useRef(null);
  const navigate = useNavigate();

  const onMove = (e) => {
    const el = glowRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  return (
    <section
      id="home"
      onMouseMove={onMove}
      className="relative overflow-hidden bg-[#0a0a0b] text-white"
    >
      {/* BACKDROP — warmer gold tone, subtle aurora + grid */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(251,191,36,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_20%_30%,rgba(245,158,11,0.10),rgba(34,197,94,0.10),rgba(99,102,241,0.10),transparent_70%)]" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl bg-amber-400/20" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-emerald-500/16" />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%222%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%22.35%22/></svg>')",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* mouse-follow spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(460px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.075), transparent 38%)",
        }}
      />

      {/* ✅ better container padding + mobile spacing */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-14 md:pt-16 md:pb-20 lg:pt-24">
        {/* ✅ mobile-first: copy first, visual second */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-10">
          {/* LEFT: copy */}
          <div className="lg:col-span-7">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              className="relative rounded-3xl backdrop-blur-xl shadow-[0_18px_70px_-22px_rgba(0,0,0,0.55)] p-5 sm:p-7 lg:p-8"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.10), rgba(255,255,255,0.05))",
              }}
            >
              <motion.p
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
              >
                ✨ BlsunTech — faster • safer • smarter
              </motion.p>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="mt-4 text-[2.05rem] leading-[1.08] font-extrabold sm:text-5xl sm:leading-[1.05] lg:text-6xl"
              >
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
                    Build it right.
                  </span>
                  <span className="pointer-events-none absolute inset-x-0 -top-1 h-[120%] [mask-image:linear-gradient(90deg,transparent,black,transparent)]">
                    <span className="block h-full w-24 translate-x-[-20%] animate-[shine_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent [transform:skewX(-12deg)]" />
                  </span>
                </span>{" "}
                <span className="text-white">Ship it fast.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-4 text-white/85 text-base sm:text-lg max-w-2xl"
              >
                We design, build, and scale modern products—web apps, AI copilots,
                cloud infra, and secure automation.{" "}
                <span className="text-white">From idea to production</span>, with
                measurable outcomes and a partner you can trust.
              </motion.p>

              <motion.ul
                variants={fadeUp}
                custom={3}
                className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 text-white/90"
              >
                {[
                  "MVPs in weeks, not months",
                  "Security & performance by default",
                  "US + Africa delivery, timezone-friendly",
                  "Compliance-ready DevOps pipelines",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 rounded-2xl px-3 py-3 backdrop-blur-md border border-white/10"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
                    }}
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 text-amber-300 flex-none"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="leading-snug">{t}</span>
                  </li>
                ))}
              </motion.ul>

              {/* ✅ mobile: buttons full width and stacked; desktop: inline */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4"
              >
                <button
                  type="button"
                  onClick={() => navigate("/start-project")}
                  className={`${btnPrimary} w-full sm:w-auto`}
                >
                  <span className="relative z-10">Start a project</span>
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                      <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/50 blur-md animate-[sweep_1.1s_ease-in-out]" />
                    </span>
                  </span>
                </button>

                <a href="#projects" className={`${btnGlass} w-full sm:w-auto`}>
                  <span className="relative z-10">See our work</span>
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/45 blur-md opacity-0 group-hover:opacity-100 transition animate-[sweep_1.1s_ease-in-out]" />
                  </span>
                </a>

                <a href="#services" className={`${btnGlass} w-full sm:w-auto`}>
                  <span className="relative z-10">What we do</span>
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/45 blur-md opacity-0 group-hover:opacity-100 transition animate-[sweep_1.1s_ease-in-out]" />
                  </span>
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={5}
                className="mt-6 text-sm text-amber-100/80"
              >
                Trusted across{" "}
                <span className="text-white font-medium">
                  real estate, education, retail, & cybersecurity
                </span>{" "}
                in the US & Africa.
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT: visual */}
          <div className="lg:col-span-5">
            <div className="mx-auto w-full max-w-[520px]">
              <div
                ref={glowRef}
                className="relative rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-[0_20px_80px_-24px_rgba(0,0,0,0.6)] border border-white/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.10), rgba(255,255,255,0.05))",
                }}
              >
                <div
                  className="pointer-events-none absolute -inset-px rounded-3xl"
                  style={{
                    background:
                      "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(251,191,36,0.18), transparent 52%)",
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  className="relative"
                >
                  <Lottie
                    animationData={shoppingAnimation}
                    loop
                    style={{
                      width: "100%",
                      maxWidth: 420,
                      height: "auto",
                      marginInline: "auto",
                    }}
                  />
                </motion.div>

                {/* ✅ badges repositioned so they don’t crash into edges on small screens */}
                <motion.div
                  className="absolute left-4 top-4"
                  initial={{ opacity: 0, y: -6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.55 }}
                >
                  <Badge>AI Features</Badge>
                </motion.div>

                <motion.div
                  className="absolute right-4 top-4"
                  initial={{ opacity: 0, y: -6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.75, duration: 0.55 }}
                >
                  <Badge variant="cyan">Cloud Native</Badge>
                </motion.div>

                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 bottom-4"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.95, duration: 0.55 }}
                >
                  <Badge variant="indigo">Security First</Badge>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-30%) skewX(-12deg); opacity: 0; }
          45% { opacity: 1; }
          100% { transform: translateX(130%) skewX(-12deg); opacity: 0; }
        }
        @keyframes sweep {
          0%   { transform: translateX(0);   opacity: .0; }
          10%  { opacity: .95; }
          100% { transform: translateX(220%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

function Badge({ children, variant = "emerald" }) {
  const palette =
    {
      emerald: "text-emerald-200 bg-emerald-400/12 border-emerald-300/15",
      cyan: "text-cyan-200 bg-cyan-400/12 border-cyan-300/15",
      indigo: "text-indigo-200 bg-indigo-400/12 border-indigo-300/15",
    }[variant] || "text-white/85 bg-white/12 border-white/10";

  return (
    <div
      className={`rounded-full px-3 py-1 text-xs backdrop-blur-md border shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)] ${palette}`}
    >
      {children}
    </div>
  );
}
