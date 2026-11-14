const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Can't reach the API. Make sure the backend server is running.");
  }

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload;
}

export const casesApi = {
  list: () => request("/api/cases"),
  create: (caseData) => request("/api/cases", { method: "POST", body: JSON.stringify(caseData) }),
  update: (id, caseData) => request(`/api/cases/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(caseData) }),
  remove: (id) => request(`/api/cases/${encodeURIComponent(id)}`, { method: "DELETE" }),
  updateChecklist: (id, index, checked) => request(`/api/cases/${encodeURIComponent(id)}/checklist`, {
    method: "PATCH",
    body: JSON.stringify({ index, checked }),
  }),
};
