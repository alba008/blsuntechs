// src/pages/PaymentSuccess.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../components/header";

const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5050/api").replace(
  /\/$/,
  ""
);

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatMoneyFromCents(cents, currency = "usd") {
  const n = Number(cents);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency).toUpperCase(),
    }).format(n / 100);
  } catch {
    return `${(n / 100).toFixed(2)} ${String(currency).toUpperCase()}`;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ✅ simple responsive hook (no CSS needed)
function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);

    const onChange = () => setMatches(mql.matches);

    // modern + fallback
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    setMatches(mql.matches);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

export default function PaymentSuccess() {
  const query = useQuery();
  const sessionId = query.get("session_id");

  const isMobile = useMediaQuery("(max-width: 640px)");

  const [state, setState] = useState({
    status: "loading", // loading | paid | unpaid | error
    message: "",
    data: null,
    serviceLabel: null,
  });

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2200);
  };

  const verify = async (signal) => {
    if (!sessionId) {
      setState({
        status: "error",
        message: "Missing session_id. Please return to checkout and try again.",
        data: null,
        serviceLabel: null,
      });
      return;
    }

    try {
      const sessionUrl = `${API_BASE}/stripe/session/${encodeURIComponent(
        sessionId
      )}?ts=${Date.now()}`;

      const sessionRes = await fetch(sessionUrl, { signal, cache: "no-store" });
      const sessionData = await sessionRes.json().catch(() => null);

      if (!sessionRes.ok) {
        setState({
          status: "error",
          message:
            sessionData?.details ||
            sessionData?.error ||
            `Request failed (${sessionRes.status})`,
          data: sessionData,
          serviceLabel: null,
        });
        return;
      }

      // map price id -> label
      const priceId = sessionData?.metadata?.project_price_id || null;

      let label = null;
      try {
        const projectsRes = await fetch(`${API_BASE}/stripe/projects?ts=${Date.now()}`, {
          signal,
          cache: "no-store",
        });
        const projectsJson = await projectsRes.json().catch(() => null);
        const projects = projectsJson?.projects || [];
        label = projects.find((p) => p.id === priceId)?.label || null;
      } catch {
        // continue without label
      }

      const paid = sessionData?.payment_status === "paid";

      if (paid) {
        setState({
          status: "paid",
          message: "Payment confirmed. Thank you!",
          data: sessionData,
          serviceLabel: label,
        });
        return;
      }

      const s = sessionData?.status;
      setState({
        status: "unpaid",
        message:
          s === "open"
            ? "Checkout is still open — payment not completed yet."
            : s === "expired"
            ? "This checkout session expired. Please start again."
            : "Payment not confirmed for this session yet.",
        data: sessionData,
        serviceLabel: label,
      });
    } catch (err) {
      if (String(err?.name) === "AbortError") return;
      setState({
        status: "error",
        message: "Network error. Please refresh and try again.",
        data: null,
        serviceLabel: null,
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let tries = 0;

    const run = async () => {
      tries += 1;
      await verify(controller.signal);
      window.setTimeout(() => {
        if (!controller.signal.aborted && tries < 6) run();
      }, 1600);
    };

    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const data = state.data;

  const email = data?.customer_details?.email || "—";
  const customerName = data?.customer_details?.name || "—";
  const amount = formatMoneyFromCents(data?.amount_total, data?.currency);

  const service =
    state.serviceLabel ||
    data?.metadata?.project_label ||
    "Your service";

  const badge =
    state.status === "paid"
      ? { text: "Verified", tone: "ok" }
      : state.status === "unpaid"
      ? { text: "Pending", tone: "warn" }
      : state.status === "error"
      ? { text: "Needs attention", tone: "bad" }
      : { text: "Checking", tone: "info" };

  const title =
    state.status === "paid"
      ? "Payment verified"
      : state.status === "unpaid"
      ? "Payment pending"
      : state.status === "error"
      ? "We couldn’t verify your payment"
      : "Verifying payment…";

  // ✅ responsive style overrides
  const r = {
    pagePadding: isMobile ? 14 : 24,
    cardPadding: isMobile ? 16 : 22,
    h1Size: isMobile ? 22 : 26,
    gridColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
    topRowDirection: isMobile ? "column" : "row",
    badgeAlign: isMobile ? "flex-start" : "flex-end",
    actionsDirection: isMobile ? "column" : "row",
    actionBtnWidth: isMobile ? "100%" : "auto",
  };

  return (
    <>
      <Header />

      <div style={{ ...styles.page, padding: r.pagePadding }}>
        <div style={styles.bgGlowA} />
        <div style={styles.bgGlowB} />

        <div style={styles.shell}>
          <div style={{ ...styles.card, padding: r.cardPadding }}>
            <div
              style={{
                ...styles.topRow,
                flexDirection: r.topRowDirection,
                alignItems: isMobile ? "stretch" : "flex-start",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={styles.kicker}>Payment confirmation</div>
                <h1 style={{ ...styles.h1, fontSize: r.h1Size }}>{title}</h1>
                <p style={styles.sub}>
                  {state.status === "loading"
                    ? "Confirming your checkout with Stripe…"
                    : state.message}
                </p>
              </div>

              <div
                style={{
                  ...styles.badge,
                  alignSelf: r.badgeAlign,
                  ...(badge.tone === "ok"
                    ? styles.badgeOk
                    : badge.tone === "warn"
                    ? styles.badgeWarn
                    : badge.tone === "bad"
                    ? styles.badgeBad
                    : styles.badgeInfo),
                }}
              >
                <span style={styles.badgeDot} />
                {badge.text}
              </div>
            </div>

            <div style={{ ...styles.grid, gridTemplateColumns: r.gridColumns }}>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>Summary</div>

                <div style={styles.row}>
                  <div style={styles.label}>Service</div>
                  <div style={{ ...styles.value, textAlign: "right" }}>{service}</div>
                </div>

                <div style={styles.row}>
                  <div style={styles.label}>Amount</div>
                  <div style={{ ...styles.value, textAlign: "right" }}>{amount}</div>
                </div>

                <div style={styles.hr} />

                <div style={styles.row}>
                  <div style={styles.label}>Customer</div>
                  <div style={{ ...styles.value, textAlign: "right" }}>{customerName}</div>
                </div>

                <div style={styles.row}>
                  <div style={styles.label}>Email</div>
                  <div style={{ ...styles.value, textAlign: "right", overflowWrap: "anywhere" }}>
                    {email}
                  </div>
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.panelTitle}>Next steps</div>

                <p style={styles.noteText}>
                  We’ll follow up shortly with the next steps for your project. If you need support,
                  use the reference below.
                </p>

                {sessionId ? (
                  <div style={styles.refBox}>
                    <div style={styles.refLabel}>Reference</div>

                    {/* ✅ wraps cleanly on mobile */}
                    <div style={{ ...styles.refRow, flexWrap: "wrap", justifyContent: "flex-start" }}>
                      <span style={{ ...styles.mono, flex: "1 1 240px" }}>{sessionId}</span>

                      <button
                        type="button"
                        style={{ ...styles.copyBtn, width: isMobile ? "100%" : "auto" }}
                        onClick={async () => {
                          const ok = await copyText(sessionId);
                          showToast(ok ? "Reference copied" : "Copy failed");
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    ...styles.actions,
                    flexDirection: r.actionsDirection,
                  }}
                >
                  <button
                    onClick={() => window.location.reload()}
                    style={{ ...styles.primaryBtn, width: r.actionBtnWidth }}
                    type="button"
                  >
                    Refresh status
                  </button>

                  <Link to="/" style={{ ...styles.secondaryBtn, width: r.actionBtnWidth }}>
                    Back to Home
                  </Link>
                </div>

                {state.status === "unpaid" && (
                  <div style={styles.note}>
                    If you already paid, wait a moment and click <b>Refresh status</b>. Otherwise,
                    return and complete checkout again.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {toast ? <div style={styles.toast}>{toast}</div> : null}
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(1200px 600px at 10% 10%, rgba(201,162,77,0.10), transparent 60%), radial-gradient(1200px 600px at 90% 20%, rgba(96,165,250,0.10), transparent 60%), #0b1220",
    color: "#e5e7eb",
    overflow: "hidden",
  },
  bgGlowA: {
    position: "absolute",
    width: 560,
    height: 560,
    borderRadius: 999,
    left: -220,
    top: -220,
    background: "radial-gradient(circle, rgba(201,162,77,0.35), transparent 60%)",
    filter: "blur(18px)",
    pointerEvents: "none",
  },
  bgGlowB: {
    position: "absolute",
    width: 640,
    height: 640,
    borderRadius: 999,
    right: -260,
    bottom: -260,
    background: "radial-gradient(circle, rgba(96,165,250,0.30), transparent 60%)",
    filter: "blur(18px)",
    pointerEvents: "none",
  },
  shell: { width: "min(980px, 100%)", position: "relative" },
  card: {
    borderRadius: 20,
    background: "rgba(17, 24, 39, 0.78)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  topRow: {
    display: "flex",
    gap: 16,
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  kicker: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(229,231,235,0.62)",
  },
  h1: { margin: "6px 0 0", fontWeight: 900, lineHeight: 1.1 },
  sub: { margin: "10px 0 0", color: "rgba(229,231,235,0.80)", lineHeight: 1.45 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 13,
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  badgeDot: { width: 8, height: 8, borderRadius: 99, background: "currentColor", opacity: 0.9 },
  badgeOk: {
    color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.28)",
    background: "rgba(34,197,94,0.08)",
  },
  badgeWarn: {
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.28)",
    background: "rgba(245,158,11,0.08)",
  },
  badgeBad: {
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.28)",
    background: "rgba(239,68,68,0.08)",
  },
  badgeInfo: {
    color: "#60a5fa",
    border: "1px solid rgba(96,165,250,0.28)",
    background: "rgba(96,165,250,0.08)",
  },
  grid: {
    display: "grid",
    gap: 14,
    marginTop: 14,
  },
  panel: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(15, 23, 42, 0.55)",
    padding: 16,
    minWidth: 0,
  },
  panelTitle: { fontWeight: 900, marginBottom: 10, letterSpacing: 0.2 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    minWidth: 0,
  },
  label: { color: "rgba(229,231,235,0.65)", fontSize: 13 },
  value: { fontWeight: 800, overflowWrap: "anywhere", minWidth: 0 },
  hr: { height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0" },
  noteText: { margin: 0, color: "rgba(229,231,235,0.78)", lineHeight: 1.5 },
  refBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  refLabel: { fontSize: 12, color: "rgba(229,231,235,0.62)", marginBottom: 8, fontWeight: 800 },
  refRow: { display: "flex", alignItems: "center", gap: 10 },
  mono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
    color: "rgba(229,231,235,0.92)",
    overflowWrap: "anywhere",
  },
  copyBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
    borderRadius: 12,
    padding: "10px 10px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  actions: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: {
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#C9A24D",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: "12px 14px",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: 800,
    background: "rgba(255,255,255,0.03)",
  },
  note: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(229,231,235,0.78)",
    fontSize: 13,
    lineHeight: 1.45,
  },
  toast: {
    position: "fixed",
    bottom: 18,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e5e7eb",
    fontWeight: 900,
    boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
    zIndex: 50,
    maxWidth: "calc(100vw - 24px)",
    textAlign: "center",
  },
};
