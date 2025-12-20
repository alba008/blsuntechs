import { API_BASE } from "../config/env";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Try to parse JSON even on errors
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  getProjects: () => request("/stripe/projects"),
  createCheckoutSession: (payload) =>
    request("/stripe/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSession: (sessionId) => request(`/stripe/session/${encodeURIComponent(sessionId)}`),
};
