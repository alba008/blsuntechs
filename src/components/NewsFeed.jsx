// src/components/NewsFeed.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNewsAPI, fetchCurrentsAPI } from "../api/newsApi";

const tabs = [
  { id: "currents", label: "Tech News" }, // default
  { id: "newsapi",  label: "Cyber Security" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: i * 0.05 },
  }),
};

function Card({ article, i }) {
  const img =
    article?.urlToImage ||
    article?.image ||
    "https://via.placeholder.com/800x400?text=No+Image";

  let host = "";
  try {
    host = article?.url ? new URL(article.url).hostname.replace("www.", "") : "";
  } catch {}

  const desc = article?.description
    ? article.description.length > 160
      ? article.description.slice(0, 160) + "…"
      : article.description
    : "No description available.";

  const isLink = !!article?.url;
  const linkProps = isLink
    ? { href: article.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden
                 bg-white/6 backdrop-blur-xl
                 ring-1 ring-amber-300/15
                 shadow-[0_12px_44px_-16px_rgba(251,191,36,0.35)]
                 hover:shadow-[0_18px_64px_-14px_rgba(251,191,36,0.45)]
                 transition-shadow"
      variants={fadeUp}
      custom={i}
      whileHover={{ y: -4 }}
    >
      {isLink ? (
        <a {...linkProps} className="block" aria-label={article?.title || "Open article"}>
          <CardInner img={img} host={host} article={article} desc={desc} />
        </a>
      ) : (
        <div className="block">
          <CardInner img={img} host={host} article={article} desc={desc} />
        </div>
      )}
    </motion.div>
  );
}

function CardInner({ img, host, article, desc }) {
  return (
    <>
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={article?.title || "news image"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {host && (
          <span className="absolute bottom-3 left-3 text-[11px] font-medium
                           text-amber-100 bg-black/40
                           ring-1 ring-amber-300/25 rounded-full px-2 py-1">
            {host}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base sm:text-lg font-semibold text-amber-50 mb-2">
          {article?.title || "Untitled"}
        </h3>
        <p className="text-sm text-white/85 mb-3">{desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">
            {article?.author ? `By ${article.author}` : ""}
          </span>
          {article?.url && (
            <span className="inline-flex items-center gap-1 text-amber-300 text-sm group-hover:text-amber-200 transition-colors">
              Read More
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* warm soft glow under cursor */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition duration-500"
        style={{
          background:
            "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(251,191,36,0.0), transparent 0%)",
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
        }}
      />
    </>
  );
}

function Skeleton({ i }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="relative rounded-2xl overflow-hidden
                 bg-white/6 backdrop-blur-xl
                 ring-1 ring-amber-300/15"
    >
      <div className="h-44 w-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-4/5 animate-pulse bg-white/05 rounded" />
        <div className="h-4 w-full animate-pulse bg-white/0 rounded" />
        <div className="h-4 w-2/3 animate-pulse bg-white/10 rounded" />
        <div className="h-4 w-24 ms-auto animate-pulse bg-white/10 rounded" />
      </div>
    </motion.div>
  );
}

// golden comets drifting down-right
const COMETS = [
  { top: "10%", left: "75%", delay: "0.2s", dur: "7.2s" },
  { top: "26%", left: "58%", delay: "1.6s", dur: "8s" },
  { top: "44%", left: "82%", delay: "2.9s", dur: "7.4s" },
  { top: "62%", left: "66%", delay: "3.6s", dur: "8.2s" },
];

const NewsFeed = () => {
  const DEFAULT_SOURCE = "currents";
  const [articles, setArticles] = useState([]);
  const [source, setSource] = useState(() => {
    const saved = localStorage.getItem("newsSource");
    return saved || DEFAULT_SOURCE;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("newsSource", source);
  }, [source]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        let data = [];
        if (source === "currents") data = await fetchCurrentsAPI();
        else if (source === "newsapi") data = await fetchNewsAPI();
        if (isMounted) setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load news:", err);
        if (isMounted) setArticles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [source]);

  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-24 px-6 sm:px-8 bg-[#0a0a0b]">
      {/* animated background — warm aurora + grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(251,191,36,0.16),transparent_60%)]" />
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full blur-3xl bg-amber-400/5" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-emerald-500/2" />

        <div
          className="pointer-events-none absolute inset-0 opacity-15 mix-blend-screen nf-dot-slow"
          style={{
            backgroundImage:
              "radial-gradient(rgba(251,191,36,0.05) 1px, transparent 1px), radial-gradient(rgba(16,185,129,0.35) 1px, transparent 1px)",
            backgroundSize: "12px 12px, 32px 32px",
            backgroundPosition: "0 0, 11px 11px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-12 mix-blend-screen nf-dot-fast"
          style={{
            backgroundImage:
              "radial-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), radial-gradient(rgba(99,102,241,0.22) 1px, transparent 1px)",
            backgroundSize: "14px 14px, 26px 26px",
            backgroundPosition: "6px 6px, 3px 3px",
          }}
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {COMETS.map((c, i) => (
            <span
              key={i}
              className="nf-comet"
              style={{ top: c.top, left: c.left, animationDelay: c.delay, animationDuration: c.dur }}
            >
              <i />
            </span>
          ))}
        </div>
      </div>

      <motion.h2
        className="text-4xl sm:text-5xl font-extrabold text-center mb-8 tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(90deg, #fde68a 0%, #fbbf24 40%, #fff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Tech Trends
      </motion.h2>

      {/* segmented control (glassy pill; active = white pill on amber ring) */}
      <div className="mx-auto mb-10 flex justify-center">
        <div className="relative inline-flex rounded-full ring-1 ring-amber-300/20 bg-white/6 backdrop-blur-xl px-1 py-1 shadow-[0_12px_28px_-16px_rgba(251,191,36,0.35)]">
          {tabs.map((t) => {
            const active = source === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSource(t.id)}
                className={`relative z-10 px-4 sm:px-5 py-2 text-sm sm:text-[0.95rem] font-medium transition-colors ${
                  active ? "text-black" : "text-white/85 hover:text-white"
                }`}
                aria-pressed={active}
                type="button"
              >
                {active && (
                  <motion.span
                    layoutId="nf-pill"
                    className="absolute inset-0 z-[-1] rounded-full bg-gradient-to-b from-white to-white shadow"
                    transition={{ type: "spring", stiffness: 520, damping: 36 }}
                    aria-hidden="true"
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* content grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={loading ? "loading" : source + (articles?.length || 0)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mx-auto grid max-w-7xl gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} i={i} />)
          ) : !articles || articles.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center text-white/70">
              No news articles found.
            </motion.p>
          ) : (
            articles.map((a, i) => (
              <Card key={a?.url || `${i}-${a?.title || "item"}`} article={a} i={i} />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Local CSS: dot drift + comets */}
      <style>{`
        @keyframes nf-dot-drift-slow {
          0% { background-position: 0 0, 11px 11px; }
          100% { background-position: 18px 22px, 29px 33px; }
        }
        @keyframes nf-dot-drift-fast {
          0% { background-position: 6px 6px, 3px 3px; }
          100% { background-position: 30px 20px, 18px 14px; }
        }
        .nf-dot-slow { animation: nf-dot-drift-slow 32s linear infinite; }
        .nf-dot-fast { animation: nf-dot-drift-fast 22s linear infinite; }

        @keyframes nf-shoot {
          0%   { transform: translate3d(0,0,0) rotate(18deg); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translate3d(480px,140px,0) rotate(18deg); opacity: 0; }
        }
        .nf-comet {
          position: absolute;
          width: 150px; height: 2px;
          background: linear-gradient(90deg,
            rgba(251,191,36,0.95),
            rgba(251,191,36,0.55),
            rgba(251,191,36,0));
          filter: drop-shadow(0 0 6px rgba(251,191,36,0.6));
          transform: rotate(18deg);
          animation-name: nf-shoot;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0.9;
        }
        .nf-comet i {
          position: absolute; right: 0; top: -3px;
          width: 8px; height: 8px; border-radius: 9999px;
          background: white;
          box-shadow: 0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(251,191,36,0.7);
        }
      `}</style>
    </section>
  );
};

export default NewsFeed;
