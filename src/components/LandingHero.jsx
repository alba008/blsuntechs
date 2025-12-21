// src/components/LandingHero.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom"; // ✅ ADD
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

export default function LandingHero({ onOpenStartProject }) {
  const glowRef = useRef(null);
  const navigate = useNavigate(); // ✅ ADD

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

      <div className="relative mx-auto max-w-9xl px-2 sm:px-2 pt-4 pb-16 md:pt-32 md:pb-28">
        {/* layout: left 3/4, right 1/4 on lg+ */}
        <div className="grid items-center gap-4 lg:gap-20 xl:gap-4 lg:grid-cols-4">
          {/* LEFT: copy on glass */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              className="relative rounded-3xl backdrop-blur-xl shadow-[0_18px_70px_-22px_rgba(0,0,0,0.55)] p-8 sm:p-8"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(255,255,255,0.05))",
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
                className="mt-4 text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05]"
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
                className="mt-4 text-white/85 text-lg max-w-2xl"
              >
                We design, build, and scale modern products—web apps, AI
                copilots, cloud infra, and secure automation.{" "}
                <span className="text-white">From idea to production</span>, with
                measurable outcomes and a partner you can trust.
              </motion.p>

              <motion.ul
                variants={fadeUp}
                custom={3}
                className="mt-7 grid sm:grid-cols-2 gap-4 text-white/90"
              >
                {[
                  "MVPs in weeks, not months",
                  "Security & performance by default",
                  "US + Africa delivery, timezone-friendly",
                  "Compliance-ready DevOps pipelines",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 rounded-2xl px-1.5 py-3 backdrop-blur-md"
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
                    <span>{t}</span>
                  </li>
                ))}
              </motion.ul>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                {/* ✅ ONLY CHANGE IS THIS onClick */}
                <button
                  type="button"
                  onClick={() => navigate("/start-project")}
                  className={btnPrimary}
                >
                  <span className="relative z-10">Start a project</span>
                  {/* shiny sweep */}
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                      <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/50 blur-md animate-[sweep_1.1s_ease-in-out]" />
                    </span>
                  </span>
                </button>

                <a href="#projects" className={btnGlass}>
                  <span className="relative z-10">See our work</span>
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/45 blur-md opacity-0 group-hover:opacity-100 transition animate-[sweep_1.1s_ease-in-out]" />
                  </span>
                </a>

                <a href="#services" className={btnGlass}>
                  <span className="relative z-10">What we do</span>
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/45 blur-md opacity-0 group-hover:opacity-100 transition animate-[sweep_1.1s_ease-in-out]" />
                  </span>
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={5}
                className="mt-8 text-sm text-amber-100/80"
              >
                Trusted across{" "}
                <span className="text-white font-medium">
                  real estate, education, retail, & cybersecurity
                </span>{" "}
                in the US & Africa.
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT: visual frame */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <div
              ref={glowRef}
              className="relative rounded-3xl p-0 backdrop-blur-xl shadow-[0_20px_80px_-24px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,255,0.05))",
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.25 }}
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

              {/* floating badges */}
              <motion.div
                className="absolute -left-2 top-8 px-5"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Badge>AI Features</Badge>
              </motion.div>
              <motion.div
                className="absolute -right-2 top-8 px-5"
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Badge variant="cyan">Cloud Native</Badge>
              </motion.div>
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 -bottom-3 py-5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <Badge variant="indigo">Security First</Badge>
              </motion.div>
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
      emerald: "text-emerald-200 bg-emerald-400/12",
      cyan: "text-cyan-200 bg-cyan-400/12",
      indigo: "text-indigo-200 bg-indigo-400/12",
    }[variant] || "text-white/85 bg-white/12";

  return (
    <div
      className={`rounded-full px-3 py-1 text-xs backdrop-blur-md shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)] ${palette}`}
    >
      {children}
    </div>
  );
}
