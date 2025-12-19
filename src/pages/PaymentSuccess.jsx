import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("checking");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("missing");
      return;
    }

    (async () => {
      const res = await fetch(`http://localhost:4000/api/stripe/session/${sessionId}`);
      const data = await res.json();
      setDetails(data);

      if (data?.payment_status === "paid") setStatus("paid");
      else setStatus("not_paid");
    })();
  }, []);

  if (status === "checking") return <div style={{ padding: 24 }}>Checking payment…</div>;
  if (status === "missing") return <div style={{ padding: 24 }}>Missing session id.</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h2>{status === "paid" ? "Payment Confirmed ✅" : "Payment Not Confirmed"}</h2>
      <pre style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
        {JSON.stringify(details, null, 2)}
      </pre>
    </div>
  );
}
