// src/pages/AdminEnquiries.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * ✅ Works in BOTH CRA (webpack) and Vite
 * - CRA env: process.env.REACT_APP_*
 * - Vite env: import.meta.env.VITE_*
 */

// ---- Helpers to read env safely in either toolchain ----
const isVite =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  typeof import.meta.env === "object";

const ENV = {
  PROD: isVite ? !!import.meta.env.PROD : process.env.NODE_ENV === "production",
  API_BASE: isVite
    ? import.meta.env.VITE_API_BASE
    : process.env.REACT_APP_API_BASE,
  ADMIN_TOKEN: isVite
    ? import.meta.env.VITE_INTAKE_ADMIN_TOKEN
    : process.env.REACT_APP_INTAKE_ADMIN_TOKEN,
};

// Normalize API base and guarantee exactly one /api
const API_BASE = (ENV.PROD ? "" : ENV.API_BASE || "http://localhost:5050").replace(
  /\/$/,
  ""
);

const API = API_BASE
  ? API_BASE.endsWith("/api")
    ? API_BASE
    : `${API_BASE}/api`
  : "/api";

const ADMIN_TOKEN = (ENV.ADMIN_TOKEN || "").trim();

// Optional service list
const SERVICE_OPTIONS = [
  "Website Development",
  "Web & App Development",
  "Mobile App Development",
  "UI/UX Design",
  "Cybersecurity",
  "Cloud & DevOps",
  "API Integrations",
  "Data / Analytics",
  "AI",
];

function formatDateTime(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function safeStr(v) {
  return (v ?? "").toString();
}

export default function AdminEnquiries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filters
  const [q, setQ] = useState("");
  const [service, setService] = useState("All");
  const [timeline, setTimeline] = useState("All");

  // Paging
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchIntakes = async () => {
    setLoading(true);
    setErr("");

    try {
      if (!ADMIN_TOKEN) {
        throw new Error(
          `Admin token missing. Set ${
            isVite ? "VITE_INTAKE_ADMIN_TOKEN" : "REACT_APP_INTAKE_ADMIN_TOKEN"
          } and restart the dev server.`
        );
      }

      const url = `${API}/intakes?limit=500`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Request failed (${res.status}). ${text ? `Server says: ${text}` : ""}`.trim()
        );
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.items || [];

      const normalized = items.map((r) => ({
        id: r.id ?? r._id ?? "",
        ts: r.ts ?? r.createdAt ?? r.created_at ?? r.created ?? "",
        ip: r.ip ?? "",
        ua: r.ua ?? "",
        name: r.name ?? "",
        email: r.email ?? "",
        company: r.company ?? "",
        service: r.service ?? "",
        budget: r.budget ?? "",
        timeline: r.timeline ?? "",
        message: r.message ?? r.details ?? "",
      }));

      normalized.sort((a, b) => new Date(b.ts) - new Date(a.ts));

      setRows(normalized);
      setPage(1);
    } catch (e) {
      setErr(e?.message || "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timelines = useMemo(() => {
    const set = new Set(rows.map((r) => safeStr(r.timeline)).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchesService = service === "All" ? true : r.service === service;
      const matchesTimeline =
        timeline === "All" ? true : safeStr(r.timeline) === timeline;

      const haystack = [
        r.id,
        r.name,
        r.email,
        r.company,
        r.service,
        r.budget,
        r.timeline,
        r.message,
        r.ip,
      ]
        .join(" ")
        .toLowerCase();

      return matchesService && matchesTimeline && (!needle || haystack.includes(needle));
    });
  }, [rows, q, service, timeline]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <section className="min-h-screen bg-[#0B0F17] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Admin · Enquiries
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Leads submitted from Start Project.
            </p>
            <p className="mt-2 text-xs text-white/50">
              API: <span className="font-mono">{API}</span>
            </p>
          </div>

          <button
            onClick={fetchIntakes}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {!!err && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="text-xs text-white/70">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company, message…"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-white/70">Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/20"
            >
              <option value="All">All</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-white/70">Timeline</label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/20"
            >
              {timelines.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="text-sm text-white/70">
              {loading ? "Loading…" : `Showing ${filtered.length} enquiries`}
            </div>
            <div className="text-xs text-white/50">
              Page <span className="text-white">{page}</span> /{" "}
              <span className="text-white">{pages}</span>
            </div>
          </div>

          {!loading && !err && filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-white/70">
              No enquiries found.
            </div>
          )}

          <div className="divide-y divide-white/10">
            {paged.map((r) => (
              <div key={`${r.id}-${r.ts}`} className="p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-base font-semibold">
                      {r.name || "Unnamed"}
                    </div>
                    <div className="mt-1 text-sm text-white/70">
                      {r.email || "No email"}
                      {r.company ? ` · ${r.company}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      {formatDateTime(r.ts)} ·{" "}
                      <span className="font-mono">{r.id}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.service ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                          {r.service}
                        </span>
                      ) : null}
                      {r.timeline ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
                          {r.timeline}
                        </span>
                      ) : null}
                      {r.budget ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
                          Budget: {r.budget}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {r.message ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                    {r.message}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 p-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-white/50">
          You’re running: <span className="font-mono">{isVite ? "Vite" : "CRA/Webpack"}</span>{" "}
          · Token loaded:{" "}
          <span className="font-mono">{ADMIN_TOKEN ? "yes" : "no"}</span>
        </div>
      </div>
    </section>
  );
}
