export function exportPDF(canonical, opts = {}) {
  // Stub: real PDF generation should be implemented on server side
  return {
    error: "exporter_not_implemented",
    message: "Generic PDF exporter not implemented (server-side required).",
  };
}

export default { exportPDF };
