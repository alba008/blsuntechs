// src/components/AboutCarousel.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    title: "Who We Are",
    body: `BlsunTech is a results-driven technology company headquartered in New Jersey, USA.
We specialize in full-stack web development, AI and data-driven applications, cloud infrastructure,
e-commerce, and intelligent automation.

Our projects span real estate, education, retail, and cybersecurity.
We build systems that are scalable, secure, and impactful — turning ideas into production-ready tech.`,
  },
  {
    title: "Our Vision",
    body: `To be the trusted partner for secure, data-driven products in East Africa and beyond — 
bridging ideas to production, creating value for businesses and communities, and advancing inclusive innovation.`,
  },
  {
    title: "Our Mission",
    body: `Design, build, and operate modern web apps, AI pipelines, and cloud infrastructure with security by default.
Automate operations, mentor teams, and deliver measurable outcomes for our clients.`,
  },
];

export default function AboutCarousel() {
  const [index, setIndex] = useState(0);
  const len = slides.length;
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  // stable controls
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, 6000);
  }, [len, stop]);

  const prev = useCallback(() => setIndex((i) => (i - 1 + len) % len), [len]);
  const next = useCallback(() => setIndex((i) => (i + 1) % len), [len]);
  const goTo = useCallback((i) => setIndex(i), []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    },
    [prev, next]
  );

  const onTouchStart = (e) => (touchStartX.current = e.changedTouches[0].clientX);
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touchStartX.current ?? 0);
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchStartX.current = null;
  };

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#0a0a0b] py-24 px-6"
      onMouseEnter={stop}
      onMouseLeave={start}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="About BlsunTech"
      style={{
        backgroundImage:
          // background image + warm aurora sweep
          "linear-gradient(180deg, rgba(10,10,11,0.85), rgba(10,10,11,0.85)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* subtle gold glow + grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(251,191,36,0.16),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl">
        <h2 className="text-4xl font-extrabold text-center mb-10">
          <span className="bg-gradient-to-r from-amber-200 via-amber-50 to-white bg-clip-text text-transparent">
            About Us
          </span>
        </h2>

        {/* viewport */}
        <div
          className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl shadow-[0_18px_70px_-22px_rgba(0,0,0,0.6)] ring-1 ring-amber-300/10"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* track */}
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s, i) => (
              <article
                key={i}
                className="relative shrink-0 basis-full p-8 md:p-14"
                role="group"
                aria-roledescription="slide"
                aria-label={`${s.title} (${i + 1} of ${len})`}
              >
                {/* glass card content */}
                <div className="mx-auto max-w-3xl">
                  <h3 className="text-3xl md:text-4xl font-semibold mb-4 text-amber-50">
                    {s.title}
                  </h3>
                  <p className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-white/90">
                    {s.body}
                  </p>
                </div>

                {/* ambient corner lights */}
                <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
              </article>
            ))}
          </div>
        </div>

        {/* controls */}
        <div className="mt-7 flex items-center justify-between">
          {/* dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2.5 w-8 rounded-full transition-all ${
                    active
                      ? "bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.65)] w-10"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={active ? "true" : "false"}
                />
              );
            })}
          </div>

          {/* arrows */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="relative px-4 py-2 rounded-full text-white hover:text-black
                         bg-white/10 hover:bg-white/20 backdrop-blur-md
                         shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)]
                         ring-1 ring-amber-300/10 hover:ring-amber-300/30
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="Previous slide"
            >
              <span className="relative z-10">←</span>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.45),transparent_62%)] opacity-40" />
            </button>
            <button
              onClick={next}
              className="relative px-4 py-2 rounded-full text-white hover:text-black
                         bg-white/10 hover:bg-white/20 backdrop-blur-md
                         shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)]
                         ring-1 ring-amber-300/10 hover:ring-amber-300/30
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="Next slide"
            >
              <span className="relative z-10">→</span>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.45),transparent_62%)] opacity-40" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
