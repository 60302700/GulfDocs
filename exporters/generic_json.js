export function exportJSON(canonical, opts = {}) {
  const blob = JSON.stringify(
    { exported_at: new Date().toISOString(), payload: canonical },
    null,
    2,
  );
  return { format: "json", data: blob };
}

export default { exportJSON };
