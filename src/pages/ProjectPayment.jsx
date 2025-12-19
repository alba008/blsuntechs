import { useEffect, useState } from "react";

export default function ProjectPayment() {
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/stripe/projects");
        const data = await res.json();
        setProjects(data.projects || []);
        setProjectId((data.projects && data.projects[0]?.id) || "");
      } catch (e) {
        setErr("Failed to load projects.");
      }
    })();
  }, []);

  async function pay() {
    setErr("");
    if (!name.trim()) return setErr("Please enter your name.");
    if (!projectId) return setErr("Please select a project.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), projectId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h2>Start a Project</h2>
      <p style={{ opacity: 0.8 }}>
        Enter your name, select a project, and continue to secure payment.
      </p>

      <label>Your name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        style={{ width: "100%", padding: 12, margin: "8px 0 16px" }}
      />

      <label>Select a project</label>
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        style={{ width: "100%", padding: 12, margin: "8px 0 16px" }}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      {err ? <div style={{ marginBottom: 12 }}>{err}</div> : null}

      <button
        onClick={pay}
        disabled={loading}
        style={{ width: "100%", padding: 12, fontWeight: 700 }}
      >
        {loading ? "Redirecting…" : "Continue to Payment"}
      </button>
    </div>
  );
}
