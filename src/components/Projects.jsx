// src/components/Projects.jsx
import React from "react";
import { motion } from "framer-motion";

const projects = [
  {
    title: "Makutanoni.com – Virtual Mall Marketplace",
    description:
      "A modern virtual shopping mall with multi-vendor listings, Amazon affiliate integration, and intelligent discovery.",
    tech: ["Django", "PostgreSQL", "TailwindCSS", "n8n"],
    link: "https://makutanoni.com",
  },
  {
    title: "KiraEstate.com – Real Estate Marketplace",
    description:
      "A real estate marketplace for Tanzania & East Africa featuring map-based property search & filters, agent dashboards, saved favorites, nearby places, and contact/booking flows.",
    tech: ["AlpineJS", "TailwindCSS", "Google Maps", "M-Pesa API"],
    link: "https://kiraestate.com",
  },
  {
    title: "Sockcs.com – E-commerce & Analytics",
    description:
      "A data-driven online shop with visitor tracking, product recommendations, and SEO-optimized architecture.",
    tech: ["Django", "Custom API", "Google Analytics", "Email Auth"],
    link: "https://sockcs.com",
  },
  {
    title: "The Watcher – Education LMS Platform",
    description:
      "A full-featured learning platform with course uploads, dashboards, and real-time progress tracking.",
    tech: ["React", "Firebase", "Realtime DB", "Progress Metrics"],
    link: "https://ithewatcher.com",
  },
];

// --- motion helpers (unchanged) ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// --- UI atoms ---
function TechBadge({ label }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs
                 text-[#f5deb3] bg-white/5 backdrop-blur
                 ring-1 ring-[#f5deb3]/25 shadow-[0_8px_20px_-12px_rgba(255,215,150,0.45)]"
    >
      {label}
    </span>
  );
}

function ProjectCard({ project }) {
  // 3D tilt + cursor glow (unchanged)
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const midX = r.width / 2;
    const midY = r.height / 2;
    const rotX = ((y - midY) / midY) * -6;
    const rotY = ((x - midX) / midX) * 6;
    el.style.setProperty("--rx", `${rotX}deg`);
    el.style.setProperty("--ry", `${rotY}deg`);
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };
  const onLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <motion.div variants={item}>
      <div onMouseMove={onMove} onMouseLeave={onLeave} className="group relative [perspective:1000px]">
        {/* warm golden gradient border (matches Login card ring/glow) */}
        <div
          className="relative rounded-2xl p-[1px]
                     bg-gradient-to-br from-[#f5deb3]/60 via-[#caa46c]/25 to-[#f5deb3]/60
                     shadow-[0_12px_44px_-16px_rgba(255,215,150,0.35)]"
        >
          {/* glass card */}
          <div
            className="relative rounded-2xl p-6 backdrop-blur-xl
                       ring-1 ring-[#f5deb3]/20
                       transition-transform duration-300 will-change-transform"
            style={{
              transform: "rotateX(var(--rx,0)) rotateY(var(--ry,0))",
              background: "rgba(20,20,25,0.85)", // mirrors Login card bg
              boxShadow: "0 0 25px rgba(255, 215, 150, 0.08)",
            }}
          >
            {/* hover glow follows cursor */}
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
              style={{
                background:
                  "radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(255,215,150,0.16), transparent 45%)",
              }}
            />
            <h3
              className="text-xl md:text-2xl font-semibold mb-2 text-[#f6ecd4]"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 0 15px rgba(255, 215, 150, 0.2)",
              }}
            >
              {project.title}
            </h3>
            <p className="text-sm md:text-base text-white/85 mb-4">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {project.tech.map((t) => (
                <TechBadge key={t} label={t} />
              ))}
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                           text-black bg-gradient-to-b from-[#f5deb3] via-[#f5deb3] to-[#caa46c]
                           hover:from-[#e9d39f] hover:to-[#f5deb3]
                           shadow-[0_12px_28px_-12px_rgba(255,215,150,0.65)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5deb3]/70"
              >
                <span className="relative z-10">View Project</span>
                {/* shiny sweep */}
                <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                  <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/55 blur-md opacity-0 group-hover:opacity-100 transition animate-[sweep_1.1s_ease-in-out]" />
                </span>
                <svg className="h-4 w-4 text-black/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="relative py-24 bg-cover bg-center bg-blend-multiply overflow-hidden"
      style={{
        // match Login page background gradient
        background:
          "linear-gradient(to bottom right, #0b0b0e, #1c1917, #2a2523)",
      }}
    >
      {/* background layers (warm aurora + subtle grid + golden blobs) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(255,215,150,0.08),transparent_30%)]" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-[#f5deb3]/20" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-emerald-500/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
        />
      </div>

      <motion.div
        className="max-w-6xl mx-auto px-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
          variants={item}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #f5deb3, #fff4d0, #f5deb3)",
                  textShadow: "0 0 15px rgba(255,215,150,0.2)",
                }}>
            Our Projects
          </span>
        </motion.h2>

        <motion.p className="text-center text-white/80 max-w-2xl mx-auto mb-12" variants={item}>
          A curated selection of platforms and products crafted with performance, clarity, and delightful UI at the core.
        </motion.p>

        <motion.div className="grid md:grid-cols-2 gap-8 lg:gap-10" variants={container}>
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </motion.div>
      </motion.div>

      {/* local sweep keyframes */}
      <style>{`
        @keyframes sweep {
          0%   { transform: translateX(0);   opacity: .0; }
          10%  { opacity: .95; }
          100% { transform: translateX(220%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
