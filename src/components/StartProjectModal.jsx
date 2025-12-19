// src/components/StartProjectModal.jsx
import React, { useEffect, useRef, useState } from "react";

// Same-origin in prod; localhost in dev only if explicitly set
const API_BASE =
  typeof process !== "undefined" && process.env?.REACT_APP_API_BASE
    ? process.env.REACT_APP_API_BASE
    : "";

/* ---------------- Theme tokens (gold + glass) ---------------- */
// const GOLD = "#f5deb3";
const GOLD_SOFT = "rgba(245,222,179,.35)";
const TEXT = "rgba(255,255,255,.96)";
const TEXT_DIM = "rgba(255,255,255,.75)";
const CARD_BG = "rgba(255,255,255,.06)";
const CARD_BORDER = "rgba(255,255,255,.10)";

/* ---------------- Helpers ---------------- */
function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm mb-1"
      style={{ color: TEXT_DIM }}
    >
      {children}
    </label>
  );
}

function InputBase(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border px-3 py-2 text-white outline-none " +
        "focus:ring-2 " +
        (props.className || "")
      }
      style={{
        background: "rgba(255,255,255,.06)",
        borderColor: CARD_BORDER,
        ...(props.style || {}),
      }}
    />
  );
}

function SelectBase(props) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-lg border px-3 py-2 text-white outline-none " +
        "focus:ring-2 " +
        (props.className || "")
      }
      style={{
        background: "rgba(255,255,255,.06)",
        borderColor: CARD_BORDER,
        ...(props.style || {}),
      }}
    />
  );
}

function TextAreaBase(props) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-lg border px-3 py-2 text-white outline-none " +
        "focus:ring-2 " +
        (props.className || "")
      }
      style={{
        background: "rgba(255,255,255,.06)",
        borderColor: CARD_BORDER,
        ...(props.style || {}),
      }}
    />
  );
}

export default function StartProjectModal({ open, onClose, presetService }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: presetService || "",
    budget: "",
    timeline: "",
    message: "",
    botcheck: "",
  });

  const [status, setStatus] = useState({ sending: false, done: false, error: "" });
  const [serverInfo, setServerInfo] = useState(null);

  const dialogRef = useRef(null);
  const titleId = "start-project-title";

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, service: presetService || f.service }));
      setStatus({ sending: false, done: false, error: "" });
      setServerInfo(null);

      // prevent page behind from scrolling
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // focus dialog for accessibility & capture Esc
      dialogRef.current?.focus();

      const onKeyDown = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKeyDown);

      return () => {
        document.body.style.overflow = prev || "";
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [presetService, open, onClose]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.botcheck) return;

    setStatus({ sending: true, done: false, error: "" });
    setServerInfo(null);

    try {
      const res = await fetch(`${API_BASE}/api/start-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      setServerInfo({
        id: data?.id || "N/A",
        receivedAt: data?.receivedAt || new Date().toISOString(),
      });
      setStatus({ sending: false, done: true, error: "" });
    } catch (err) {
      setStatus({ sending: false, done: false, error: err.message || "Failed to send" });
    }
  };

  const copyRef = async () => {
    if (!serverInfo?.id) return;
    try {
      await navigator.clipboard.writeText(serverInfo.id);
      alert("Reference ID copied!");
    } catch {}
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop with warm aurora */}
      <button
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close modal backdrop"
        style={{
          background:
            "radial-gradient(900px 420px at 50% -10%, rgba(251,191,26,0.12), transparent 30%), rgba(0,0,0,.7)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Frame with warm gradient border + inner glass card */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-[1px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(4,2,17,.05), rgba(202,164,108,.28), rgba(2,2,1,.05))",
          boxShadow: "0 18px 70px -22px rgba(0,0,0,.06)",
        }}
      >
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="rounded-3xl p-6 sm:p-7"
          style={{
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            outline: "none",
            position: "relative",
          }}
        >
          {/* Cursor-follow highlight on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-3xl"
            style={{
              background:
                "radial-gradient(580px 220px at var(--mx,50%) var(--my,0%), rgba(245,222,179,.12), transparent 55%)",
              opacity: 0.8,
            }}
          />

          {/* Header */}
          <div
            className="flex items-start justify-between gap-4"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - r.left;
              const y = e.clientY - r.top;
              e.currentTarget.parentElement?.style.setProperty("--mx", `${x}px`);
              e.currentTarget.parentElement?.style.setProperty("--my", `${y}px`);
            }}
          >
            <div>
              <h3
                id={titleId}
                className="text-xl sm:text-2xl font-extrabold"
                style={{ color: TEXT, letterSpacing: ".2px" }}
              >
                Start a Project
              </h3>
              <p className="text-sm mt-1" style={{ color: TEXT_DIM }}>
                Tell us a bit about your goals and timeline. We’ll reply within 48 hours.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-sm"
              aria-label="Close modal"
              type="button"
              style={{
                color: TEXT,
                background: "rgba(255,255,255,.08)",
                border: `1px solid ${CARD_BORDER}`,
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          {status.done ? (
            <div className="mt-6 space-y-4">
              <div
                className="rounded-xl p-4"
                style={{
                  border: `1px solid ${GOLD_SOFT}`,
                  background:
                    "linear-gradient(180deg, rgba(245,222,179,.14), rgba(245,222,179,.08))",
                  color: TEXT,
                }}
              >
                <div className="font-semibold">
                  Thank you, {form.name || "friend"}! 🎉
                </div>
                <div style={{ color: TEXT_DIM }}>
                  We’ve received your brief for{" "}
                  <span className="font-medium" style={{ color: TEXT }}>
                    {form.service || "your project"}
                  </span>
                  .
                </div>
              </div>

              <div
                className="rounded-xl p-4"
                style={{
                  border: `1px solid ${CARD_BORDER}`,
                  background: "rgba(255,255,255,.05)",
                }}
              >
                <label className="text-sm mb-1 block" style={{ color: TEXT_DIM }}>
                  Reference ID
                </label>
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-sm break-all" style={{ color: TEXT }}>
                    {serverInfo?.id}
                  </code>
                  <button
                    onClick={copyRef}
                    className="rounded-full px-3 py-1.5 text-xs"
                    type="button"
                    style={{
                      color: TEXT,
                      background: "rgba(255,255,255,.08)",
                      border: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="text-xs mt-2" style={{ color: TEXT_DIM }}>
                  Received: {new Date(serverInfo?.receivedAt).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-full px-5 py-2 font-semibold"
                  type="button"
                  style={{
                    color: "#121212",
                    background:
                      "linear-gradient(90deg, #f5deb3, #caa46c, #f5deb3)",
                    boxShadow: "0 0 20px rgba(255,215,150,0.25)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              {/* honeypot */}
              <input
                type="text"
                id="botcheck"
                name="botcheck"
                autoComplete="off"
                className="hidden"
                value={form.botcheck}
                onChange={update}
                tabIndex={-1}
              />

              {/* grid: keep two-up feel on small if you like; or use sm:grid-cols-2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <InputBase
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={update}
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/40"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <InputBase
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={update}
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="company">Company</FieldLabel>
                  <InputBase
                    id="company"
                    name="company"
                    autoComplete="organization"
                    value={form.company}
                    onChange={update}
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/40"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="service">Service</FieldLabel>
                  <SelectBase
                    id="service"
                    name="service"
                    required
                    value={form.service}
                    onChange={update}
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/40"
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    <option>Web & App Development</option>
                    <option>E-commerce & Payments</option>
                    <option>AI, Data & Analytics</option>
                    <option>Cybersecurity</option>
                    <option>Cloud & DevOps</option>
                    <option>No-Code & Automation</option>
                    <option>PropTech Solutions</option>
                    <option>Energy & IoT</option>
                  </SelectBase>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="budget">Budget</FieldLabel>
                  <SelectBase
                    id="budget"
                    name="budget"
                    required
                    value={form.budget}
                    onChange={update}
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/40"
                  >
                    <option value="" disabled>
                      Select budget
                    </option>
                    <option>Under $5k</option>
                    <option>$5k – $15k</option>
                    <option>$15k – $40k</option>
                    <option>$40k+</option>
                  </SelectBase>
                </div>
                <div>
                  <FieldLabel htmlFor="timeline">Timeline</FieldLabel>
                  <SelectBase
                    id="timeline"
                    name="timeline"
                    required
                    value={form.timeline}
                    onChange={update}
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/10"
                  >
                    <option value="" disabled>
                      Select timeline
                    </option>
                    <option>ASAP</option>
                    <option>2–4 weeks</option>
                    <option>1–3 months</option>
                    <option>3+ months</option>
                  </SelectBase>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <FieldLabel htmlFor="message">Brief</FieldLabel>
                  <TextAreaBase
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={update}
                    placeholder="Describe the problem, users, and success criteria…"
                    style={{ color: TEXT }}
                    className="focus:ring-amber-300/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2"
                  style={{
                    color: TEXT,
                    background: "rgba(255,255,255,.08)",
                    border: `1px solid ${CARD_BORDER}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={status.sending}
                  className="rounded-full px-5 py-2 font-semibold disabled:opacity-60"
                  style={{
                    color: "#121212",
                    background:
                      "linear-gradient(90deg, #f5deb3, #caa46c, #f5deb3)",
                    boxShadow: "0 0 20px rgba(255,215,150,0.25)",
                  }}
                >
                  {status.sending ? "Sending…" : "Submit"}
                </button>
              </div>

              {status.error && (
                <div className="text-sm mt-2" style={{ color: "rgba(255,130,130,.95)" }}>
                  {status.error}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
