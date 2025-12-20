// src/pages/ProjectPayment.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/header";

/**
 * Accept either:
 * - REACT_APP_API_BASE="http://localhost:5050"     (we add /api)
 * - REACT_APP_API_BASE="http://localhost:5050/api" (we keep it)
 */
const API_BASE_RAW = (process.env.REACT_APP_API_BASE || "http://localhost:5050").replace(/\/$/, "");
const API = API_BASE_RAW.endsWith("/api") ? API_BASE_RAW : `${API_BASE_RAW}/api`;

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
    const id = "project-payment-prod-keyframes";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      @keyframes shimmer { 0% { background-position: 0% 0%; } 100% { background-position: -200% 0%; } }
      @keyframes pop { 0% { transform: translateY(6px); opacity: 0;} 100% { transform: translateY(0); opacity: 1;} }
    `;
    document.head.appendChild(style);
  }, []);
}

export default function ProjectPayment() {
  useKeyframesOnce();

  // Two paths like your modal: enquiry vs pay now
  const [mode, setMode] = useState("enquiry"); // "enquiry" | "pay"

  // Loaded packages/services
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  // Enquiry fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Status
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const abortRef = useRef(null);

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(projectId)),
    [projects, projectId]
  );

  const priceText = useMemo(() => {
    if (!selectedProject) return null;
    const cur = String(selectedProject.currency || "USD").toUpperCase();
    return fmtMoney(selectedProject.amount, cur);
  }, [selectedProject]);

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanNotes = notes.trim();

  const nameOk = cleanName.length >= 2;
  const emailOk = cleanEmail.length >= 6 && cleanEmail.includes("@");

  // Submission rules
  const canPayNow = !busy && !loading && projects.length > 0 && !!projectId;
  const canEnquire = canPayNow && nameOk && emailOk;

  useEffect(() => {
    let alive = true;
    setErr("");
    setNotice("");

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        setLoading(true);

        // internal route name stays; UI never reveals provider
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
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  function resetMessages() {
    setErr("");
    setNotice("");
  }

  async function submitEnquiry(e) {
    e?.preventDefault?.();
    resetMessages();
    if (!canEnquire) return;

    setBusy(true);
    try {
      const res = await fetch(`${API}/start-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          service: selectedProject?.label || "Service",
          message: cleanNotes,
          projectId,
          intent: "enquiry",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to submit enquiry.");

      setNotice("Enquiry received. We’ll reach out to confirm scope, timeline, and kickoff steps.");
      setName("");
      setEmail("");
      setNotes("");
    } catch (e2) {
      setErr(e2?.message || "Failed to submit enquiry.");
    } finally {
      setBusy(false);
    }
  }

  async function goToSecureCheckout(e) {
    e?.preventDefault?.();
    resetMessages();
    if (!canPayNow) return;

    setBusy(true);
    try {
      // Your server currently requires "name" for metadata.
      // To keep Pay Now minimal, we send a safe fallback if user didn't enter anything.
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

  const headline =
    mode === "pay" ? "Pick a service. Pay securely. Start fast." : "Tell us what you need — we’ll guide the build.";

  const subhead =
    mode === "pay"
      ? "Select a service package and continue to encrypted checkout. After payment, we confirm scope and start onboarding."
      : "Submit an enquiry first. We’ll confirm scope, timeline, and deliverables — then you can proceed to secure payment when ready.";

  return (
    <div style={{ minHeight: "100vh", background: "#0e1116" }}>
      <Header />

      <main style={S.page}>
        <div style={S.shell}>
          {/* HERO */}
          <section style={S.hero}>
            <div style={S.heroTop}>
              <div style={S.kicker}>BlsunTech Dynamics · Project Intake</div>

              <div style={S.modeRow} role="tablist" aria-label="Choose a path">
                <ModeButton
                  active={mode === "enquiry"}
                  onClick={() => {
                    resetMessages();
                    setMode("enquiry");
                  }}
                >
                  Enquiry first
                </ModeButton>

                <ModeButton
                  active={mode === "pay"}
                  onClick={() => {
                    resetMessages();
                    setMode("pay");
                  }}
                >
                  Pay now
                </ModeButton>
              </div>
            </div>

            <h1 style={S.h1}>{headline}</h1>
            <p style={S.sub}>{subhead}</p>

            <div style={S.trustRow}>
              <Pill>Encrypted checkout</Pill>
              <Pill>Clear deliverables</Pill>
              <Pill>Production-ready</Pill>
              <Pill>Ongoing support</Pill>
            </div>
          </section>

          {/* SERVICES (from your packages list) */}
          <section style={S.section}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>Services</div>
              <div style={S.sectionSub}>
                These are the current packages available. You can add more anytime — the page will update automatically.
              </div>
            </div>

            <div style={S.servicesGrid}>
              {loading ? (
                <>
                  <ServiceSkeleton />
                  <ServiceSkeleton />
                  <ServiceSkeleton />
                </>
              ) : projects.length ? (
                projects.map((p) => {
                  const isActive = String(projectId) === String(p.id);
                  const cur = String(p.currency || "USD").toUpperCase();
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProjectId(String(p.id))}
                      style={{
                        ...S.serviceCard,
                        ...(isActive ? S.serviceCardActive : null),
                      }}
                    >
                      <div style={S.serviceTop}>
                        <div style={S.serviceName}>{p.label}</div>
                        <div style={S.servicePrice}>{fmtMoney(p.amount, cur)}</div>
                      </div>

                      <div style={S.serviceMeta}>
                        <span style={S.metaDot} />
                        <span style={{ opacity: 0.78 }}>
                          Ideal for teams that want a clean kickoff and professional delivery.
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div style={S.emptyBox}>No services available.</div>
              )}
            </div>
          </section>

          {/* ACTION CARD (reduces repetition: one place to act) */}
          <section style={S.card}>
            <div style={S.cardTop}>
              <div style={S.cardTitle}>Start</div>
              <div style={S.cardSub}>
                {mode === "pay"
                  ? "Fast path: confirm a service and continue to secure checkout."
                  : "Guided path: share details first, then proceed to payment if you choose."}
              </div>
            </div>

            <div style={S.cardBody}>
              {/* Status */}
              <div style={S.statusRow}>
                {err ? (
                  <div style={S.alertError}>
                    <strong style={{ display: "block", marginBottom: 4 }}>Action needed</strong>
                    <span style={{ opacity: 0.92 }}>{err}</span>
                  </div>
                ) : notice ? (
                  <div style={S.alertSuccess}>
                    <strong style={{ display: "block", marginBottom: 4 }}>Received</strong>
                    <span style={{ opacity: 0.92 }}>{notice}</span>
                  </div>
                ) : (
                  <div style={S.alertInfo}>
                    <strong style={{ display: "block", marginBottom: 4 }}>
                      {mode === "pay" ? "Ready for secure checkout" : "Send a quick enquiry"}
                    </strong>
                    <span style={{ opacity: 0.92 }}>
                      {selectedProject
                        ? `Selected: ${selectedProject.label}${priceText ? ` · ${priceText}` : ""}`
                        : "Select a service above to continue."}
                    </span>
                  </div>
                )}
              </div>

              {/* Pay Now = minimal */}
              {mode === "pay" ? (
                <div style={S.payRow}>
                  <div style={S.payNote}>
                    <div style={{ fontWeight: 950, marginBottom: 6 }}>What happens after payment</div>
                    <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                      You’ll receive a confirmation and we’ll begin onboarding to lock scope, access, timeline,
                      and deliverables. We keep communication clear and professional.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goToSecureCheckout}
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
                </div>
              ) : (
                /* Enquiry = collects info */
                <form onSubmit={submitEnquiry} style={{ width: "100%" }}>
                  <div style={S.grid2}>
                    <Field label="Your name" hint={name && !nameOk ? "Please enter your full name." : "So we can address you properly."}>
                      <input
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
                    </Field>

                    <Field label="Email" hint={email && !emailOk ? "Please enter a valid email." : "We’ll send next steps here."}>
                      <input
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
                    </Field>
                  </div>

                  <Field label="Notes (optional)" hint="Add goals, deadlines, links, or current system details.">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Example: I want a React dashboard + API deployed on AWS, with authentication and analytics…"
                      disabled={busy}
                      rows={4}
                      style={{ ...S.input, resize: "vertical", minHeight: 110 }}
                    />
                  </Field>

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

                    <div style={S.sideNote}>
                      Want to skip discussion? Switch to <b>Pay now</b>.
                    </div>
                  </div>
                </form>
              )}

              {/* Security note (no provider names) */}
              <div style={S.footerNote}>
                <div style={S.lockRow}>
                  <span style={S.lock}>🔒</span>
                  <span style={{ opacity: 0.88 }}>
                    Encrypted checkout. Payment details are handled by a certified payment processor and are never stored on BlsunTech systems.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SHIPPING DEV -> PROD */}
          <section style={S.section}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>How we ship from development to production</div>
              <div style={S.sectionSub}>
                A real delivery process — clean handoff, stable deployments, and ongoing improvement.
              </div>
            </div>

            <div style={S.shipGrid}>
              <ShipCard
                title="1) Plan + scope"
                body="We confirm goals, success criteria, and deliverables. Then we define milestones so the work stays predictable."
              />
              <ShipCard
                title="2) Build in a dev environment"
                body="We develop features in small increments, with clear commits and reviewable changes. Nothing fragile, no surprises."
              />
              <ShipCard
                title="3) QA + staging checks"
                body="We test flows end-to-end, validate performance, and check security basics. Staging mirrors production where possible."
              />
              <ShipCard
                title="4) Deploy + monitor"
                body="We deploy via repeatable steps (CI/CD), verify logs and health checks, and monitor for regressions."
              />
            </div>

            <div style={S.shipFooter}>
              <span style={S.metaDotBig} />
              <div style={{ opacity: 0.82, lineHeight: 1.6 }}>
                Typical tooling: GitHub-based workflow, environment variables, containerized services where needed, health endpoints,
                structured logs, and post-deploy verification.
              </div>
            </div>
          </section>

          <div style={S.smallPrint}>
            You control the pace. Choose <b>Enquiry first</b> for guided onboarding, or <b>Pay now</b> for the fastest kickoff.
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- components ---------------- */

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S.modeBtn,
        ...(active ? S.modeBtnActive : null),
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function Pill({ children }) {
  return <span style={S.pill}>{children}</span>;
}

function Field({ label, hint, children }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      <div style={S.inputWrap}>{children}</div>
      <div style={S.help}>{hint}</div>
    </div>
  );
}

function ShipCard({ title, body }) {
  return (
    <div style={S.shipCard}>
      <div style={S.shipTitle}>{title}</div>
      <div style={S.shipBody}>{body}</div>
    </div>
  );
}

function ServiceSkeleton() {
  return <div style={S.serviceSkeleton} />;
}

/* ---------------- styles ---------------- */

const S = {
  page: {
    padding: "22px 16px 70px",
    display: "flex",
    justifyContent: "center",
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(201,162,77,0.16), transparent 60%), radial-gradient(1000px 500px at 100% 10%, rgba(120,180,255,0.12), transparent 55%), #0e1116",
    color: TEXT,
  },
  shell: { width: "100%", maxWidth: 1100 },

  hero: {
    borderRadius: 20,
    padding: 18,
    border: `1px solid ${BORDER}`,
    background:
      "radial-gradient(900px 320px at 20% -60px, rgba(201,162,77,0.20), transparent 62%), radial-gradient(850px 380px at 100% 0%, rgba(120,180,255,0.12), transparent 55%), rgba(255,255,255,0.03)",
    boxShadow: "0 16px 56px -36px rgba(0,0,0,0.85)",
    marginBottom: 14,
    animation: "pop 260ms ease-out",
  },

  heroTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
    fontSize: 13,
    opacity: 0.92,
    letterSpacing: 0.2,
    fontWeight: 850,
  },

  modeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
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

  h1: { margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: -0.4, lineHeight: 1.12 },
  sub: { marginTop: 10, marginBottom: 0, opacity: 0.82, maxWidth: 880, lineHeight: 1.65 },

  trustRow: { marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 850,
    letterSpacing: 0.15,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
    color: "rgba(244,246,248,0.92)",
  },

  section: { marginTop: 18 },
  sectionHead: { marginBottom: 10 },
  sectionTitle: { fontWeight: 950, fontSize: 16, marginBottom: 6 },
  sectionSub: { opacity: 0.78, lineHeight: 1.55, maxWidth: 900 },

  servicesGrid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  },
  serviceCard: {
    textAlign: "left",
    borderRadius: 18,
    padding: 16,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 12px 34px -26px rgba(0,0,0,0.8)",
    cursor: "pointer",
    transition: "transform 120ms ease, border 120ms ease, background 120ms ease",
  },
  serviceCardActive: {
    border: "1px solid rgba(201,162,77,0.55)",
    background: "radial-gradient(700px 200px at 20% 0%, rgba(201,162,77,0.16), transparent), rgba(255,255,255,0.03)",
    transform: "translateY(-1px)",
  },
  serviceTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  serviceName: { fontWeight: 950, lineHeight: 1.2 },
  servicePrice: { fontWeight: 950, opacity: 0.92, whiteSpace: "nowrap" },
  serviceMeta: { marginTop: 10, display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.55 },
  metaDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 6,
    background: GOLD,
    boxShadow: "0 0 0 4px rgba(201,162,77,0.12)",
    flex: "0 0 auto",
  },
  emptyBox: {
    borderRadius: 18,
    padding: 16,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.03)",
    opacity: 0.85,
  },
  serviceSkeleton: {
    height: 122,
    borderRadius: 18,
    border: `1px solid ${BORDER}`,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.25s infinite linear",
  },

  card: {
    marginTop: 18,
    borderRadius: 20,
    border: `1px solid ${BORDER}`,
    background: BG,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  cardTop: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.00))",
  },
  cardTitle: { fontWeight: 950, fontSize: 15, marginBottom: 6 },
  cardSub: { opacity: 0.78, lineHeight: 1.55 },

  cardBody: { padding: 16 },

  statusRow: { marginBottom: 12 },
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

  payRow: { display: "grid", gap: 12 },
  payNote: {
    borderRadius: 18,
    padding: 14,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },

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
  help: { marginTop: 8, fontSize: 12.5, opacity: 0.72, lineHeight: 1.45 },

  ctaRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  sideNote: { fontSize: 13, color: TEXT_DIM, lineHeight: 1.35 },

  cta: {
    flex: "1 1 320px",
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
    borderTop: "1px solid rgba(255,255,255,0.08)",
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

  shipGrid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  },
  shipCard: {
    borderRadius: 18,
    padding: 16,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 12px 34px -26px rgba(0,0,0,0.8)",
  },
  shipTitle: { fontWeight: 950, marginBottom: 6 },
  shipBody: { opacity: 0.82, lineHeight: 1.6 },

  shipFooter: {
    marginTop: 12,
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,0.18)",
  },
  metaDotBig: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 6,
    background: GOLD,
    boxShadow: "0 0 0 4px rgba(201,162,77,0.12)",
    flex: "0 0 auto",
  },

  smallPrint: { marginTop: 16, fontSize: 12.5, opacity: 0.65, lineHeight: 1.5, color: TEXT_DIM },

  spinner: {
    width: 16,
    height: 16,
    borderRadius: 999,
    border: "2px solid rgba(244,246,248,0.35)",
    borderTopColor: "rgba(244,246,248,0.95)",
    animation: "spin 0.9s linear infinite",
  },
};
