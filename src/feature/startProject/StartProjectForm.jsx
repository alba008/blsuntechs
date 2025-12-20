import { useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useProjects } from "./useProjects";

export default function StartProjectForm() {
  const { projects, loading, error } = useProjects();
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // auto-select first project once loaded
  useMemo(() => {
    if (!projectId && projects?.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const cleanName = name.trim();
    if (!cleanName) return setSubmitError("Please enter your name.");
    if (!projectId) return setSubmitError("Please select a project.");

    setSubmitting(true);
    try {
      const data = await api.createCheckoutSession({ name: cleanName, projectId });

      if (!data?.url) {
        throw new Error("Missing Stripe checkout URL from server.");
      }

      // ✅ Always redirect when url exists
      window.location.assign(data.url);
    } catch (err) {
      setSubmitError(err.message || "Checkout failed.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Start a Project</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Tell us who you are and choose a project. You’ll be redirected to secure checkout.
      </p>

      {loading ? <p>Loading projects…</p> : null}
      {error ? <p style={{ opacity: 0.9 }}>Error: {error}</p> : null}

      {!loading && !error ? (
        <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            style={{ width: "100%", padding: 12, marginBottom: 14 }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Select a project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 14 }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {submitError ? <p style={{ marginTop: 0 }}>{submitError}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: 12,
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Redirecting…" : "Continue to Payment"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
