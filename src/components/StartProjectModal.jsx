// src/components/StartProjectModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * server/index.js mounts app at /api:
 *   server.use("/api", app)
 * so:
 *   GET  /api/stripe/projects
 *   POST /api/start-project
 */
const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");
const API = API_BASE ? (API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`) : "/api";

// Theme tokens
const TEXT = "rgba(244,246,248,0.96)";
const TEXT_DIM = "rgba(244,246,248,0.72)";
const BORDER = "rgba(244,246,248,0.12)";
const BG = "rgba(255,255,255,0.04)";

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        border: "2px solid rgba(255,255,255,0.25)",
        borderTopColor: "rgba(255,255,255,0.95)",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "rgba(255,255,255,0.06)",
        color: TEXT,
        padding: "11px 12px",
        outline: "none",
        ...style,
      }}
    />
  );
}

function Select({ style, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "rgba(255,255,255,0.06)",
        color: TEXT,
        padding: "11px 12px",
        outline: "none",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

function TextArea({ style, ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: 110,
        resize: "vertical",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "rgba(255,255,255,0.06)",
        color: TEXT,
        padding: "11px 12px",
        outline: "none",
        ...style,
      }}
    />
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 13, color: TEXT_DIM, marginBottom: 6 }}>{children}</div>;
}

function Pill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        border: `1px solid ${BORDER}`,
        background: "rgba(255,255,255,0.04)",
        fontSize: 12.5,
        color: TEXT_DIM,
      }}
    >
      {children}
    </span>
  );
}

export default function StartProjectModal({ open, onClose }) {
  const panelRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsErr, setProjectsErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    projectId: "",
    message: "",
    botcheck: "",
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState("");

  const selectedProject = useMemo(() => {
    return projects.find((p) => String(p.id) === String(form.projectId)) || null;
  }, [projects, form.projectId]);

  const projectOk = !!form.projectId;
  const nameOk = form.name.trim().length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const messageOk = form.message.trim().length >= 8;

  // Enquiry: require full info
  const canSubmitEnquiry = !busy && projectOk && nameOk && emailOk && messageOk;

  useEffect(() => {
    if (!open) return;

    setErr("");
    setDone(false);
    setRefId("");
    setProjectsErr("");
    setForm((f) => ({ ...f, botcheck: "" }));

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => panelRef.current?.focus?.(), 0);

    let alive = true;
    (async () => {
      try {
        setLoadingProjects(true);
        const res = await fetch(`${API}/stripe/projects`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load packages.");

        const list = Array.isArray(data?.projects) ? data.projects : [];
        if (!alive) return;

        setProjects(list);
        setForm((prevForm) => ({
          ...prevForm,
          projectId: prevForm.projectId || (list[0]?.id ? String(list[0].id) : ""),
        }));
      } catch (e) {
        if (!alive) return;
        setProjects([]);
        setProjectsErr(e?.message || "Failed to load packages.");
      } finally {
        if (alive) setLoadingProjects(false);
      }
    })();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      alive = false;
      document.body.style.overflow = prev || "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Enquiry: save intake only (no payment)
  async function submitEnquiry(e) {
    e.preventDefault();
    if (form.botcheck) return;

    setErr("");
    setBusy(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        flow: "enquiry",
        projectId: String(form.projectId),
        projectLabel: selectedProject?.label || "",
        projectAmount: selectedProject?.amount ?? null,
        projectCurrency: selectedProject?.currency || "usd",
        message: form.message.trim(),
      };

      const res = await fetch(`${API}/start-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      const id = data?.id || "";
      setRefId(id);
      setDone(true);
      setBusy(false);
    } catch (e2) {
      setBusy(false);
      setErr(e2?.message || "Failed to submit.");
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        color: TEXT,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          border: "none",
          cursor: "pointer",
          background:
            "radial-gradient(1100px 520px at 20% -10%, rgba(201,162,77,0.18), transparent 55%), radial-gradient(900px 420px at 100% 10%, rgba(120,180,255,0.14), transparent 55%), rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* frame */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 820,
          borderRadius: 24,
          padding: 1,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(201,162,77,0.30), rgba(120,180,255,0.16))",
          boxShadow: "0 24px 80px -28px rgba(0,0,0,0.85)",
        }}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          style={{
            borderRadius: 24,
            padding: 20,
            background: BG,
            border: `1px solid ${BORDER}`,
            maxHeight: "90vh",
            overflowY: "auto",
            outline: "none",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <Pill>Project enquiry</Pill>
                <Pill>Onboarding first</Pill>
              </div>

              <div style={{ fontSize: 24, fontWeight: 950, letterSpacing: -0.2 }}>
                Start a BlsunTech project
              </div>

              <div style={{ marginTop: 8, color: TEXT_DIM, lineHeight: 1.6, maxWidth: 640 }}>
                Send an enquiry to begin onboarding. We confirm scope and next steps by email.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                border: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.06)",
                color: TEXT,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              ✕
            </button>
          </div>

          {/* Errors */}
          {projectsErr ? (
            <div
              style={{
                marginTop: 14,
                borderRadius: 14,
                padding: 12,
                border: "1px solid rgba(255,120,120,0.30)",
                background: "rgba(255,80,80,0.10)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 4 }}>Couldn’t load packages</div>
              <div style={{ color: TEXT_DIM }}>{projectsErr}</div>
            </div>
          ) : null}

          {err ? (
            <div
              style={{
                marginTop: 14,
                borderRadius: 14,
                padding: 12,
                border: "1px solid rgba(255,120,120,0.30)",
                background: "rgba(255,80,80,0.10)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 4 }}>We couldn’t proceed</div>
              <div style={{ color: TEXT_DIM }}>{err}</div>
            </div>
          ) : null}

          {/* Package selector (no price/checkout box) */}
          <div style={{ marginTop: 12 }}>
            <Label>Choose a package *</Label>
            <Select
              name="projectId"
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              disabled={loadingProjects || !projects.length || busy}
            >
              {!projects.length ? (
                <option value="">{loadingProjects ? "Loading packages…" : "No packages available"}</option>
              ) : null}
              {projects.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>

          {/* ✅ ENQUIRY ONLY */}
          <form onSubmit={submitEnquiry} style={{ marginTop: 14 }}>
            <input
              type="text"
              name="botcheck"
              value={form.botcheck}
              onChange={update}
              autoComplete="off"
              tabIndex={-1}
              style={{ display: "none" }}
            />

            {done ? (
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 18,
                  padding: 14,
                  border: "1px solid rgba(201,162,77,0.40)",
                  background: "linear-gradient(180deg, rgba(201,162,77,0.16), rgba(255,255,255,0.02))",
                }}
              >
                <div style={{ fontWeight: 950, marginBottom: 6 }}>Enquiry received.</div>
                <div style={{ color: TEXT_DIM, lineHeight: 1.55 }}>
                  We’ll follow up for onboarding and scope confirmation.
                </div>
                {refId ? (
                  <div style={{ marginTop: 8, fontSize: 12.5, color: TEXT_DIM }}>
                    Reference: <code style={{ color: TEXT }}>{refId}</code>
                  </div>
                ) : null}
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      borderRadius: 12,
                      padding: "10px 12px",
                      border: `1px solid ${BORDER}`,
                      background: "rgba(255,255,255,0.06)",
                      color: TEXT,
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                marginTop: 14,
              }}
            >
              <div style={{ gridColumn: "span 6" }}>
                <Label>Your name *</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="Full name"
                  autoComplete="name"
                  disabled={busy}
                />
              </div>

              <div style={{ gridColumn: "span 6" }}>
                <Label>Email *</Label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={busy}
                />
              </div>

              <div style={{ gridColumn: "span 12" }}>
                <Label>Company (optional)</Label>
                <Input
                  name="company"
                  value={form.company}
                  onChange={update}
                  placeholder="Company / organization"
                  autoComplete="organization"
                  disabled={busy}
                />
              </div>

              <div style={{ gridColumn: "span 12" }}>
                <Label>Quick note *</Label>
                <TextArea
                  name="message"
                  value={form.message}
                  onChange={update}
                  placeholder="Tell us what you need (short and clear)."
                  disabled={busy}
                />
                <div style={{ marginTop: 6, fontSize: 12.5, color: TEXT_DIM }}>
                  This helps us onboard you faster.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                flexWrap: "wrap",
                borderTop: `1px solid ${BORDER}`,
                paddingTop: 14,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                style={{
                  borderRadius: 12,
                  padding: "10px 12px",
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.06)",
                  color: TEXT,
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 900,
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmitEnquiry}
                style={{
                  borderRadius: 12,
                  padding: "10px 14px",
                  border: "1px solid rgba(201,162,77,0.55)",
                  background: canSubmitEnquiry
                    ? "linear-gradient(90deg, rgba(201,162,77,0.98), rgba(245,222,179,0.92))"
                    : "rgba(255,255,255,0.10)",
                  color: canSubmitEnquiry ? "#0e1116" : "rgba(244,246,248,0.55)",
                  cursor: canSubmitEnquiry ? "pointer" : "not-allowed",
                  fontWeight: 950,
                  boxShadow: canSubmitEnquiry ? "0 14px 36px -22px rgba(201,162,77,0.65)" : "none",
                  minWidth: 220,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {busy ? (
                  <>
                    <Spinner /> Submitting…
                  </>
                ) : (
                  <>Submit enquiry →</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
