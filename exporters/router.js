// Simple exporter router (ES module)
import { validate } from "../compliance/validator.js";

export async function routeExport(canonical, opts = {}) {
  const {
    country = "generic",
    docType = "invoice",
    format = "json",
    rules,
  } = opts;

  // Always validate first using provided rules (if any).
  const validation = validate(canonical, rules || {});
  if (!validation.valid) {
    return { error: "validation_failed", validation };
  }

  // Generic JSON exporter
  if (format === "json") {
    const mod = await import("./generic_json.js");
    return mod.exportJSON(canonical, opts);
  }

  // PDF request -> try generic PDF exporter
  if (format === "pdf") {
    try {
      const mod = await import("./generic_pdf.js");
      return mod.exportPDF(canonical, opts);
    } catch (e) {
      return {
        error: "exporter_not_implemented",
        message: "PDF exporter not implemented",
      };
    }
  }

  // Country specific routing
  if (country === "saudi_arabia") {
    if (format === "xml") {
      const mod = await import("./saudi_zatca.js");
      return mod.exportZATCA(canonical, opts);
    }
  }

  return {
    error: "exporter_not_implemented",
    message: `No exporter for ${country}/${docType}/${format}`,
  };
}

export default { routeExport };
