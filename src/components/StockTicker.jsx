// src/components/StockTicker.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

export default function StockTicker() {
  const [crypto, setCrypto] = useState(null);
  const [error, setError] = useState("");

  const items = useMemo(() => {
    if (!crypto) return [];
    return [
      { label: "BTC/USD", value: crypto?.bitcoin?.usd },
      { label: "ETH/USD", value: crypto?.ethereum?.usd },
      { label: "SOL/USD", value: crypto?.solana?.usd },
      { label: "DOGE/USD", value: crypto?.dogecoin?.usd },
    ].filter((i) => typeof i.value === "number");
  }, [crypto]);

  useEffect(() => {
    let mounted = true;

    const fetchCrypto = async () => {
      try {
        setError("");
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price",
          {
            params: {
              ids: "bitcoin,ethereum,solana,dogecoin",
              vs_currencies: "usd",
            },
          }
        );
        if (mounted) setCrypto(res.data);
      } catch (e) {
        if (mounted) setError("live prices unavailable");
        console.error("Crypto fetch failed:", e?.message || e);
      }
    };

    fetchCrypto();
    const id = setInterval(fetchCrypto, 60_000); // refresh every 60s
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // fallback announcements if API is down or blocked/rate-limited
  const fallbacks = [
    { label: "BlsunTech", value: "Design • Build • Scale" },
    { label: "Status", value: "All systems nominal" },
    { label: "Security", value: "Zero-trust by default" },
  ];

  const feed = items.length ? items : fallbacks;

  return (
    <div className="w-full overflow-hidden border-b border-amber-300/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      {/* subtle golden glow */}
      <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />

      <div
        className="relative group py-1.5"
        aria-live="polite"
        aria-busy={!items.length && !error ? "true" : "false"}
      >
        {/* gradient edge masks for nicer fade at edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a0b] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a0b] to-transparent" />

        {/* marquee track (duplicated for seamless loop) */}
        <div className="marquee inline-flex whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <span key={dup} className="inline-flex items-center">
              {feed.map((it) => (
                <span key={`${dup}-${it.label}`} className="inline-flex items-center gap-2 pr-10">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
                    <span className="text-amber-100/90 font-medium">{it.label}</span>
                  </span>
                  <span className="text-white/85">
                    {typeof it.value === "number"
                      ? `$${it.value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : <span className="text-white/60">{it.value}</span>}
                  </span>
                </span>
              ))}
              {/* spacer between loops */}
              <span className="pr-10" />
            </span>
          ))}
        </div>

        {/* tiny status note if failing */}
        {error && (
          <span className="sr-only">
            {error}. Showing site announcements instead.
          </span>
        )}
      </div>

      {/* local styles for marquee + reduced motion */}
      <style>{`
        .marquee {
          animation: blsun-marquee 28s linear infinite;
        }
        @keyframes blsun-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}
