import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await api.getProjects();
        if (!alive) return;
        setProjects(data.projects || []);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load projects.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { projects, loading, error };
}
