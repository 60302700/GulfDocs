import { exportGenericPdf } from "./generic/pdf.js";

export function exportPDF(canonical, opts = {}) {
  const res = exportGenericPdf(canonical, opts);
  return res;
}

export default { exportPDF };
