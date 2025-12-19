import React, { useEffect, useMemo, useState } from "react";

// Use same-origin in prod, localhost in dev
const API_BASE =
  process.env.NODE_ENV === "production"
    ? ""                          // => fetch("/api/...") on Vercel
    : (process.env.REACT_APP_API_BASE || "http://localhost:5050");

// Pull the admin token from env (Vite or CRA)
const ADMIN_TOKEN =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_INTAKE_ADMIN_TOKEN) ||
  process.env.REACT_APP_INTAKE_ADMIN_TOKEN ||
  "";

// Optional: keep in sync with your services list
const SERVICE_OPTIONS = [
  "Web & App Development",
  "E-commerce & Payments",
  "AI, Data & Analytics",
  "Cybersecurity",
  "Cloud & DevOps",
  "No-Code & Automation",
  "PropTech Solutions",
  "Energy & IoT",
];

const PAGE_SIZES = [10, 20, 50];

function fmt(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}
function truncate(s, n = 96) {
  const v = String(s || "");
  return v.length > n ? v.slice(0, n) + "…" : v;
}

export default function AdminEnquiries() {
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters (client-side)
  const [q, setQ] = useState("");
  const [service, setService] = useState("All");
  const [from, setFrom] = useState(""); // datetime-local
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const fetchIntakes = async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `${API_BASE}/api/intakes?limit=200`;
      const res = await fetch(url, { headers: { "x-admin-token": ADMIN_TOKEN } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRawItems(Array.isArray(data.items) ? data.items : []);
      setPage(1);
    } catch (e) {
      setErr(e.message || "Failed to load intakes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIntakes(); /* on mount */ }, []);

  // client-side filtering/sort (newest first)
  const filtered = useMemo(() => {
    let rows = [...rawItems].sort((a, b) => new Date(b.ts) - new Date(a.ts));

    if (service && service !== "All") {
      rows = rows.filter(r => (r.service || "") === service);
    }
    if (from) {
      const t = new Date(from).getTime();
      rows = rows.filter(r => new Date(r.ts).getTime() >= t);
    }
    if (to) {
      const t = new Date(to).getTime();
      rows = rows.filter(r => new Date(r.ts).getTime() <= t);
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      rows = rows.filter(r => {
        const hay = [
          r.name, r.email, r.company, r.service, r.budget, r.timeline, r.message
        ].map(x => (x || "").toString().toLowerCase()).join(" ");
        return hay.includes(needle);
      });
    }
    return rows;
  }, [rawItems, q, service, from, to]);

  // paging (client-side)
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const nextPage = () => setPage(p => Math.min(pages, p + 1));
  const prevPage = () => setPage(p => Math.max(1, p - 1));

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const downloadCSV = () => {
    const header = ["ts","id","name","email","company","service","budget","timeline","message"];
    const esc = (s="") => `"${String(s).replaceAll('"','""')}"`;
    const rows = filtered.map(r => [
      r.ts, r.id, r.name, r.email, r.company, r.service, r.budget, r.timeline, r.message
    ].map(esc).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "intakes.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Optional: requires you added DELETE /api/intakes/:id on server
  const deleteRow = async (id) => {
    const yes = window.confirm("Delete this enquiry?");
    if (!yes) return;
    try {
      const res = await fetch(`${API_BASE}/api/intakes/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": ADMIN_TOKEN }
      });
      if (!res.ok) throw new Error(await res.text());
      // Optimistic update
      setRawItems(items => items.filter(i => i.id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  return (
    <section className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Enquiries</h1>
            <p className="text-white/60 text-sm">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
              {loading ? " • loading…" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchIntakes}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              Refresh
            </button>
            <button
              onClick={downloadCSV}
              className="rounded-full bg-white text-black px-4 py-2 font-medium hover:bg-slate-100"
            >
              Download CSV
            </button>
          </div>
        </div>

        {/* filters */}
        <div className="grid md:grid-cols-4 gap-3 mb-6">
          <input
            value={q}
            onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Search name, email, company, message…"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
          <select
            value={service}
            onChange={(e)=>{ setService(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400/30"
          >
            <option>All</option>
            {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <input
            type="datetime-local"
            value={from}
            onChange={(e)=>{ setFrom(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
          <input
            type="datetime-local"
            value={to}
            onChange={(e)=>{ setTo(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>

        {/* table */}
        {err && <div className="mb-4 text-rose-300 text-sm">{err}</div>}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/80">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Name / Email</th>
                <th className="px-3 py-2 text-left">Company</th>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-left">Budget</th>
                <th className="px-3 py-2 text-left">Timeline</th>
                <th className="px-3 py-2 text-left">Message</th>
                <th className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <span>Page size</span>
                    <select
                      value={pageSize}
                      onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}
                      className="rounded-md bg-white/10 text-white px-2 py-1"
                    >
                      {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {pageItems.map(r => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-3 py-2 align-top">{fmt(r.ts)}</td>
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-white/70 flex items-center gap-2">
                      <span>{r.email}</span>
                      <button
                        onClick={()=>copy(r.email)}
                        className="text-xs rounded border border-white/10 px-1.5 py-0.5 hover:bg-white/10"
                        title="Copy email"
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">{r.company || "—"}</td>
                  <td className="px-3 py-2 align-top">{r.service}</td>
                  <td className="px-3 py-2 align-top">{r.budget || "—"}</td>
                  <td className="px-3 py-2 align-top">{r.timeline || "—"}</td>
                  <td className="px-3 py-2 align-top">{truncate(r.message)}</td>
                  <td className="px-3 py-2 align-top text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={()=>copy(r.id)}
                        className="rounded border border-white/10 bg-white/10 px-2 py-1 hover:bg-white/20"
                        title="Copy reference ID"
                      >
                        Ref
                      </button>
                      {/* Delete (works only if you added DELETE /api/intakes/:id) */}
                      <button
                        onClick={()=>deleteRow(r.id)}
                        className="rounded border border-rose-400/30 text-rose-200 bg-rose-400/10 px-2 py-1 hover:bg-rose-400/20"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td className="px-3 py-8 text-center text-white/60" colSpan={8}>
                    {loading ? "Loading…" : "No enquiries match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="mt-4 flex items-center justify-between text-white/80">
          <div>Page {page} / {pages}</div>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={nextPage}
              disabled={page >= pages}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
