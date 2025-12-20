// src/pages/ProjectPayment.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/header";

/**
 * server/index.js mounts app at /api:
 *   server.use("/api", app)
 * so:
 *   GET  /api/stripe/projects
 *   POST /api/start-project
 *   POST /api/stripe/create-checkout-session
 */
const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");
const API = API_BASE ? (API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`) : "/api";

// Theme tokens
const TEXT = "rgba(244,246,248,0.96)";
const TEXT_DIM = "rgba(244,246,248,0.72)";
const BORDER = "rgba(244,246,248,0.12)";
const BG = "rgba(255,255,255,0.04)";
const GOLD = "#C9A24D";

function fmtMoney(amount, currency = "USD") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function useKeyframesOnce() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "project-payment-flow-keyframes";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      @keyframes shimmer { 0% { background-position: 0% 0%; } 100% { background-position: -200% 0%; } }
    `;
    document.head.appendChild(style);
  }, []);
}

export default function ProjectPayment() {
  // Two modes
  const [mode, setMode] = useState("enquiry"); // "enquiry" | "pay"

  // shared
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);

  // enquiry fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // status
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const abortRef = useRef(null);

  useKeyframesOnce();

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(projectId)),
    [projects, projectId]
  );

  const priceText = useMemo(() => {
    if (!selectedProject) return "—";
    const amt = selectedProject.amount;
    const cur = String(selectedProject.currency || "USD").toUpperCase();
    return fmtMoney(amt, cur);
  }, [selectedProject]);

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMsg = message.trim();

  const emailOk = cleanEmail.length >= 5 && cleanEmail.includes("@");
  const nameOk = cleanName.length >= 2;

  // Enquiry rules: require name+email+service, message optional but encouraged
  const canEnquire =
    !busy &&
    !loadingProjects &&
    projects.length > 0 &&
    !!projectId &&
    nameOk &&
    emailOk;

  // Pay rules: ONLY service is required (fast flow)
  // (If you want name required for payment metadata, set nameOk here too)
  const canPayNow = !busy && !loadingProjects && projects.length > 0 && !!projectId;

  useEffect(() => {
    let alive = true;
    setErr("");
    setNotice("");

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        setLoadingProjects(true);

        const res = await fetch(`${API}/stripe/projects`, { signal: controller.signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load services.");

        if (!alive) return;

        const list = Array.isArray(data?.projects) ? data.projects : [];
        setProjects(list);
        setProjectId(list?.[0]?.id ? String(list[0].id) : "");

        if (!list.length) setNotice("No services are available right now.");
      } catch (e) {
        if (!alive) return;
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Failed to load services.");
      } finally {
        if (alive) setLoadingProjects(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  async function submitEnquiry(e) {
    e?.preventDefault?.();
    setErr("");
    setNotice("");

    if (!canEnquire) return;

    setBusy(true);
    try {
      const res = await fetch(`${API}/start-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          service: selectedProject?.label || "Unknown service",
          message: cleanMsg,
          projectId: projectId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to submit enquiry.");

      setNotice("Enquiry received. We’ll reach out shortly to confirm scope and next steps.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (e2) {
      setErr(e2?.message || "Failed to submit enquiry.");
    } finally {
      setBusy(false);
    }
  }

  async function goToCheckout(e) {
    e?.preventDefault?.();
    setErr("");
    setNotice("");

    if (!canPayNow) return;

    setBusy(true);
    try {
      // IMPORTANT:
      // Your current server route requires "name".
      // To keep "pay now" minimal, we can pass a safe value.
      // Better: update server to make name optional OR use email if provided.
      const payerName =
        cleanName ||
        (cleanEmail ? cleanEmail.split("@")[0] : "") ||
        "Client";

      const res = await fetch(`${API}/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: payerName, projectId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Checkout failed.");
      if (!data?.url) throw new Error("Missing checkout link from server.");

      window.location.assign(data.url);
    } catch (e2) {
      setErr(e2?.message || "Checkout failed.");
      setBusy(false);
    }
  }

  const topBadge =
    mode === "pay" ? "Secure checkout" : "Project enquiry";

  const title =
    mode === "pay" ? "Choose a service and pay securely" : "Tell us what you want to build";

  const subtitle =
    mode === "pay"
      ? "Select your service and continue to secure checkout. You’ll confirm scope during onboarding."
      : "Send a quick enquiry. We’ll confirm scope, timeline, and next steps—then you can pay when you’re ready.";

  return (
    <div style={{ minHeight: "100vh", background: "#0e1116" }}>
      <Header />

      <main style={S.page}>
        <div style={S.shell}>
          {/* Hero */}
          <section style={S.hero}>
            <div style={S.badge}>{topBadge}</div>

            <h1 style={S.h1}>{title}</h1>

            <p style={S.p}>{subtitle}</p>

            {/* Mode switch (like the modal) */}
            <div style={S.modeRow}>
              <button
                type="button"
                onClick={() => {
                  setErr("");
                  setNotice("");
                  setMode("enquiry");
                }}
                style={{
                  ...S.modeBtn,
                  ...(mode === "enquiry" ? S.modeBtnActive : null),
                }}
                aria-pressed={mode === "enquiry"}
              >
                Enquiry first
              </button>

              <button
                type="button"
                onClick={() => {
                  setErr("");
                  setNotice("");
                  setMode("pay");
                }}
                style={{
                  ...S.modeBtn,
                  ...(mode === "pay" ? S.modeBtnActive : null),
                }}
                aria-pressed={mode === "pay"}
              >
                Pay now
              </button>
            </div>

            <div style={S.trustRow}>
              <TrustPill>Encrypted checkout</TrustPill>
              <TrustPill>Clear scope</TrustPill>
              <TrustPill>Fast kickoff</TrustPill>
              <TrustPill>Support included</TrustPill>
            </div>
          </section>

          {/* Card */}
          <section style={S.card}>
            {/* Status */}
            <div style={S.statusRow}>
              {loadingProjects ? (
                <>
                  <div style={S.skeletonLine} />
                  <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
                    Loading services…
                  </div>
                </>
              ) : err ? (
                <div style={S.alertError}>
                  <strong style={{ display: "block", marginBottom: 4 }}>Action needed</strong>
                  <span style={{ opacity: 0.92 }}>{err}</span>
                </div>
              ) : notice ? (
                <div style={S.alertSuccess}>
                  <strong style={{ display: "block", marginBottom: 4 }}>Success</strong>
                  <span style={{ opacity: 0.92 }}>{notice}</span>
                </div>
              ) : (
                <div style={S.alertInfo}>
                  <strong style={{ display: "block", marginBottom: 4 }}>Choose your path</strong>
                  <span style={{ opacity: 0.92 }}>
                    {mode === "pay"
                      ? "Select a service and continue to secure checkout."
                      : "Share details and we’ll reach out to confirm scope and next steps."}
                  </span>
                </div>
              )}
            </div>

            {/* Body */}
            <div style={S.formPad}>
              {/* Service (always visible) */}
              <div style={S.field}>
                <label style={S.label} htmlFor="serviceSelect">
                  Service
                </label>

                <div style={S.inputWrap}>
                  <select
                    id="serviceSelect"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={loadingProjects || !projects.length || busy}
                    style={S.select}
                  >
                    {loadingProjects ? (
                      <option>Loading…</option>
                    ) : projects.length ? (
                      projects.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.label}
                        </option>
                      ))
                    ) : (
                      <option>No services available</option>
                    )}
                  </select>
                </div>

                {selectedProject ? (
                  <div style={S.hint}>
                    <span style={S.dot} />
                    <div style={{ lineHeight: 1.45 }}>
                      <div style={{ opacity: 0.92 }}>
                        Selected: <strong>{selectedProject.label}</strong>{" "}
                        <span style={{ opacity: 0.72 }}>•</span>{" "}
                        <strong>{priceText}</strong>
                      </div>
                      <div style={{ opacity: 0.72, fontSize: 13, marginTop: 4 }}>
                        {mode === "pay"
                          ? "You’ll confirm scope during onboarding after checkout."
                          : "We’ll confirm scope first—payment can be completed after onboarding."}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Enquiry form (hidden when Pay Now) */}
              {mode === "enquiry" ? (
                <form onSubmit={submitEnquiry}>
                  <div style={S.grid2}>
                    <div style={S.field}>
                      <label style={S.label} htmlFor="fullName">
                        Your name
                      </label>
                      <div style={S.inputWrap}>
                        <input
                          id="fullName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          autoComplete="name"
                          disabled={busy}
                          style={{
                            ...S.input,
                            ...(name && !nameOk ? S.inputWarn : null),
                          }}
                        />
                      </div>
                      <div style={S.help}>
                        {name && !nameOk ? "Please enter your full name." : "So we can address you properly."}
                      </div>
                    </div>

                    <div style={S.field}>
                      <label style={S.label} htmlFor="email">
                        Email
                      </label>
                      <div style={S.inputWrap}>
                        <input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={busy}
                          style={{
                            ...S.input,
                            ...(email && !emailOk ? S.inputWarn : null),
                          }}
                        />
                      </div>
                      <div style={S.help}>
                        {email && !emailOk ? "Please enter a valid email." : "We’ll send next steps here."}
                      </div>
                    </div>
                  </div>

                  <div style={S.field}>
                    <label style={S.label} htmlFor="message">
                      Notes (optional)
                    </label>
                    <div style={S.inputWrap}>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us the goal, timeline, and any links you want us to review…"
                        disabled={busy}
                        rows={4}
                        style={{ ...S.input, resize: "vertical", minHeight: 110 }}
                      />
                    </div>
                    <div style={S.help}>
                      A few details helps us respond faster (scope, deadline, current site/app, etc.).
                    </div>
                  </div>

                  <div style={S.ctaRow}>
                    <button
                      type="submit"
                      disabled={!canEnquire}
                      style={{
                        ...S.cta,
                        ...(canEnquire ? null : S.ctaDisabled),
                      }}
                    >
                      <span style={S.ctaInner}>
                        {busy ? (
                          <>
                            <span style={S.spinner} />
                            Submitting…
                          </>
                        ) : (
                          <>
                            Submit enquiry <span style={S.arrow}>→</span>
                          </>
                        )}
                      </span>
                    </button>

                    <div style={S.noteRight}>
                      You can switch to <b>Pay now</b> anytime.
                    </div>
                  </div>
                </form>
              ) : (
                // Pay now quick flow
                <div>
                  <div style={S.payBlurb}>
                    <div style={{ fontWeight: 950, marginBottom: 6 }}>Fast checkout</div>
                    <div style={{ opacity: 0.78, lineHeight: 1.55 }}>
                      You’re choosing a service and going straight to secure checkout.
                      Onboarding happens right after.
                    </div>
                  </div>

                  <div style={S.ctaRow}>
                    <button
                      type="button"
                      onClick={goToCheckout}
                      disabled={!canPayNow}
                      style={{
                        ...S.cta,
                        ...(canPayNow ? null : S.ctaDisabled),
                      }}
                    >
                      <span style={S.ctaInner}>
                        {busy ? (
                          <>
                            <span style={S.spinner} />
                            Opening secure checkout…
                          </>
                        ) : (
                          <>
                            Continue to secure checkout <span style={S.arrow}>→</span>
                          </>
                        )}
                      </span>
                    </button>

                    <div style={S.noteRight}>
                      Want to discuss first? Switch to <b>Enquiry first</b>.
                    </div>
                  </div>
                </div>
              )}

              {/* Security note (no provider names) */}
              <div style={S.footerNote}>
                <div style={S.lockRow}>
                  <span style={S.lock}>🔒</span>
                  <span style={{ opacity: 0.88 }}>
                    Checkout is encrypted end-to-end. Payment details are handled by a certified payment
                    processor and are never stored on BlsunTech systems.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Extra small print */}
          <div style={S.smallPrint}>
            Prefer the simplest path? Choose <b>Pay now</b>. Need clarity first? Use <b>Enquiry first</b>.
          </div>
        </div>
      </main>
    </div>
  );
}

function TrustPill({ children }) {
  return <span style={S.trustPill}>{children}</span>;
}

const S = {
  page: {
    padding: "22px 16px 56px",
    display: "flex",
    justifyContent: "center",
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(201,162,77,0.16), transparent 60%), radial-gradient(1000px 500px at 100% 10%, rgba(120,180,255,0.12), transparent 55%), #0e1116",
    color: TEXT,
  },
  shell: { width: "100%", maxWidth: 900 },

  hero: {
    borderRadius: 18,
    padding: 18,
    border: `1px solid ${BORDER}`,
    background:
      "radial-gradient(900px 240px at 30% -40px, rgba(201,162,77,0.18), transparent), rgba(255,255,255,0.03)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    marginBottom: 14,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: 999,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 10,
    color: "rgba(244,246,248,0.92)",
    fontWeight: 850,
  },
  h1: {
    fontSize: 34,
    margin: 0,
    letterSpacing: -0.35,
    lineHeight: 1.12,
    fontWeight: 950,
  },
  p: {
    margin: "10px 0 0",
    opacity: 0.8,
    lineHeight: 1.55,
    maxWidth: 760,
  },

  modeRow: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  modeBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(244,246,248,0.88)",
    fontWeight: 900,
    letterSpacing: 0.15,
    cursor: "pointer",
  },
  modeBtnActive: {
    border: "1px solid rgba(201,162,77,0.55)",
    background: "rgba(201,162,77,0.14)",
    color: TEXT,
    boxShadow: "0 14px 34px -24px rgba(201,162,77,0.45)",
  },

  trustRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  trustPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0.15,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
    color: "rgba(244,246,248,0.92)",
  },

  card: {
    borderRadius: 18,
    border: `1px solid ${BORDER}`,
    background: BG,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  statusRow: {
    padding: 16,
    borderBottom: `1px solid rgba(244,246,248,0.08)`,
  },

  alertError: {
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(255,120,120,0.30)",
    background: "rgba(255,80,80,0.10)",
  },
  alertInfo: {
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(120,180,255,0.28)",
    background: "rgba(120,180,255,0.10)",
  },
  alertSuccess: {
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(80,200,140,0.25)",
    background: "rgba(80,200,140,0.10)",
  },

  skeletonLine: {
    height: 44,
    borderRadius: 12,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.25s infinite linear",
  },

  formPad: { padding: 16 },

  field: { marginBottom: 14 },
  label: {
    display: "block",
    fontSize: 13,
    opacity: 0.92,
    marginBottom: 8,
    fontWeight: 850,
    letterSpacing: 0.15,
  },
  inputWrap: {
    borderRadius: 14,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    fontSize: 15,
    outline: "none",
    border: "none",
    color: TEXT,
    background: "transparent",
  },
  inputWarn: { boxShadow: "inset 0 0 0 1px rgba(255,180,80,0.30)" },
  select: {
    width: "100%",
    padding: "13px 14px",
    fontSize: 15,
    outline: "none",
    border: "none",
    color: TEXT,
    background: "transparent",
    appearance: "none",
  },
  help: {
    marginTop: 8,
    fontSize: 12.5,
    opacity: 0.72,
    lineHeight: 1.45,
  },

  hint: {
    marginTop: 10,
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 14,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.03)",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 5,
    background: GOLD,
    boxShadow: "0 0 0 4px rgba(201,162,77,0.12)",
    flex: "0 0 auto",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },

  payBlurb: {
    borderRadius: 14,
    padding: 14,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
    marginTop: 2,
    marginBottom: 14,
  },

  ctaRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 6,
  },
  noteRight: {
    fontSize: 13,
    color: "rgba(244,246,248,0.72)",
    lineHeight: 1.35,
  },

  cta: {
    flex: "1 1 280px",
    minWidth: 260,
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid rgba(201,162,77,0.55)",
    background: "rgba(201,162,77,0.18)",
    color: TEXT,
    fontWeight: 950,
    fontSize: 15,
    cursor: "pointer",
    transition: "transform 120ms ease, background 120ms ease",
    boxShadow: "0 16px 40px -28px rgba(201,162,77,0.40)",
  },
  ctaDisabled: { opacity: 0.55, cursor: "not-allowed", boxShadow: "none" },
  ctaInner: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 },
  arrow: { opacity: 0.9, fontWeight: 950 },

  footerNote: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: `1px solid rgba(244,246,248,0.08)`,
  },
  lockRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 13,
    lineHeight: 1.45,
    color: "rgba(244,246,248,0.92)",
  },
  lock: { lineHeight: 1.2 },

  smallPrint: {
    marginTop: 14,
    fontSize: 12.5,
    opacity: 0.65,
    lineHeight: 1.5,
    color: TEXT_DIM,
  },

  spinner: {
    width: 16,
    height: 16,
    borderRadius: 999,
    border: "2px solid rgba(244,246,248,0.35)",
    borderTopColor: "rgba(244,246,248,0.95)",
    animation: "spin 0.9s linear infinite",
  },
};
