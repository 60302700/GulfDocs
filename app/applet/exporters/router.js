/**
 * exporters/router.js
 *
 * Phase 3 — Centralized Exporter Router
 *
 * Deterministic routing layer connecting canonical documents and rules engine
 * validation to format-specific exporters.
 *
 * Target Pipeline:
 * UI -> Canonical Builder -> Canonical Document -> Rules Engine -> Validation -> Exporter Router -> Specific Exporter -> Output
 *
 * Supported GCC Countries: QA, AE, SA, BH, KW, OM
 * Supported Document Types: invoice, payslip, quotation, purchase-order, billing-details
 * Formats: pdf, json (and existing saudi_zatca xml for SA invoice)
 */

import { validateDocument } from "../rules/engine.js";
import { getRules } from "../rules/index.js";
import { validate as legacyValidate } from "../compliance/validator.js";
import { exportCanonicalJson } from "./generic/json.js";
import { exportGenericPdf } from "./generic/pdf.js";
import { exportZATCA } from "./saudi_zatca.js";

// Standard canonical document types
export const SUPPORTED_DOC_TYPES = [
  "invoice",
  "payslip",
  "quotation",
  "purchase-order",
  "billing-details",
];

// Normalized document type slug mapping
export const DOC_SLUG_MAP = {
  "invoice": "invoice",
  "payslip": "payslip",
  "quotation": "quotation",
  "purchase-order": "purchase-order",
  "purchase_order": "purchase-order",
  "billing-details": "billing-details",
  "billing_details": "billing-details",
};

// Supported GCC countries (ISO 3166-1 alpha-2)
export const SUPPORTED_COUNTRIES = ["QA", "AE", "SA", "BH", "KW", "OM"];

// Country alias mapping
export const COUNTRY_MAP = {
  "qa": "QA",
  "qatar": "QA",
  "ae": "AE",
  "uae": "AE",
  "united arab emirates": "AE",
  "sa": "SA",
  "ksa": "SA",
  "saudi": "SA",
  "saudi_arabia": "SA",
  "saudi arabia": "SA",
  "bh": "BH",
  "bahrain": "BH",
  "kw": "KW",
  "kuwait": "KW",
  "om": "OM",
  "oman": "OM",
};

/**
 * Deterministic Exporter Registry
 * Key: `${docType}:${country}:${format}`
 */
const EXPORTER_REGISTRY = {
  // SA invoice XML (existing ZATCA skeleton exporter)
  "invoice:SA:xml": {
    id: "invoice-sa-zatca-xml",
    handler: (canonical, opts) => {
      const legacyRes = exportZATCA(canonical, opts);
      return {
        success: true,
        format: "xml",
        documentType: "invoice",
        country: "SA",
        exporter: "invoice-sa-zatca-xml",
        data: legacyRes.data,
        file: {
          content: legacyRes.data,
          mimeType: "application/xml",
          filename: `${canonical.id || canonical.invoice_number || "invoice"}.xml`,
        },
      };
    },
  },
};

/**
 * Register generic JSON and PDF handlers for all 30 (5 doc types * 6 countries) valid combinations
 */
for (const rawDocType of SUPPORTED_DOC_TYPES) {
  const normDocType = DOC_SLUG_MAP[rawDocType];
  for (const country of SUPPORTED_COUNTRIES) {
    // JSON exporter
    EXPORTER_REGISTRY[`${normDocType}:${country}:json`] = {
      id: `${normDocType}-${country.toLowerCase()}-json`,
      handler: (canonical, opts) => exportCanonicalJson(canonical, opts),
    };

    // PDF exporter (Generic professional document PDF representation)
    EXPORTER_REGISTRY[`${normDocType}:${country}:pdf`] = {
      id: `${normDocType}-${country.toLowerCase()}-pdf`,
      handler: (canonical, opts) => exportGenericPdf(canonical, opts),
    };
  }
}

/**
 * Normalize and resolve country code
 */
export function normalizeCountry(raw) {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim().toLowerCase();
  return COUNTRY_MAP[clean] || (SUPPORTED_COUNTRIES.includes(clean.toUpperCase()) ? clean.toUpperCase() : null);
}

/**
 * Normalize document type
 */
export function normalizeDocType(raw) {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim().toLowerCase();
  return DOC_SLUG_MAP[clean] || null;
}

/**
 * Normalize format string
 */
export function normalizeFormat(raw) {
  if (!raw || typeof raw !== "string") return null;
  return raw.trim().toLowerCase();
}

/**
 * Central Exporter Router function
 *
 * @param {object} params
 * @param {string} [params.documentType]
 * @param {string} [params.country]
 * @param {string} [params.format="json"]
 * @param {object} [params.document] - Canonical document
 * @param {object} [params.validationResult] - Optional pre-computed validation result
 * @param {object} [params.rules] - Optional rules object from rules engine
 * @returns {Promise<object>} Structured result
 */
export async function exportDocument({
  documentType,
  country,
  format = "json",
  document: canonicalDoc,
  validationResult,
  rules,
  ...extraOpts
} = {}) {
  // Debug logging during development
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    console.debug("[ExporterRouter] incoming export request:", { documentType, country, format });
  }

  // 1. Resolve Document
  const doc = canonicalDoc;
  if (!doc || typeof doc !== "object") {
    return {
      success: false,
      code: "INVALID_DOCUMENT",
      error: "invalid_document",
      message: "A valid canonical document object is required for export.",
    };
  }

  // 2. Resolve & Normalize Country
  const rawCountry = country || doc.country;
  const resolvedCountry = normalizeCountry(rawCountry);
  if (!resolvedCountry) {
    return {
      success: false,
      code: "UNSUPPORTED_COUNTRY",
      error: "unsupported_country",
      message: `Unsupported country "${rawCountry}". Supported countries: ${SUPPORTED_COUNTRIES.join(", ")}`,
      country: rawCountry,
    };
  }

  // 3. Resolve & Normalize Document Type
  const rawDocType = documentType || doc.documentType || doc.document_type;
  const resolvedDocType = normalizeDocType(rawDocType);
  if (!resolvedDocType) {
    return {
      success: false,
      code: "UNSUPPORTED_DOCUMENT_TYPE",
      error: "unsupported_document_type",
      message: `Unsupported document type "${rawDocType}". Supported: ${SUPPORTED_DOC_TYPES.join(", ")}`,
      documentType: rawDocType,
    };
  }

  // 4. Resolve & Normalize Format
  const resolvedFormat = normalizeFormat(format);
  if (!resolvedFormat) {
    return {
      success: false,
      code: "UNSUPPORTED_FORMAT",
      error: "unsupported_format",
      message: "Export format must be specified (e.g. json, pdf).",
      format,
    };
  }

  // 5. VALIDATION GATE BEFORE EXPORT
  let validation = validationResult;
  if (!validation) {
    // If rules was not supplied, fetch rules from the rules engine
    let effectiveRules = rules;
    if (!effectiveRules) {
      try {
        effectiveRules = await getRules({
          country: resolvedCountry,
          documentType: resolvedDocType,
        });
      } catch (e) {
        // Fallback or leave empty
      }
    }

    if (effectiveRules && (effectiveRules.engine_status || typeof effectiveRules.customValidate === "function")) {
      validation = validateDocument(doc, effectiveRules);
    } else {
      // Legacy validator fallback if legacy rules shape provided
      validation = legacyValidate(doc, effectiveRules || {});
    }
  }

  // Check validation state
  if (validation && validation.valid === false) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      error: "validation_failed",
      message: "Export blocked: Document failed validation with errors.",
      documentType: resolvedDocType,
      country: resolvedCountry,
      format: resolvedFormat,
      validation,
    };
  }

  // 6. Deterministic Routing Lookup
  const registryKey = `${resolvedDocType}:${resolvedCountry}:${resolvedFormat}`;
  const exporterRegistration = EXPORTER_REGISTRY[registryKey];

  if (!exporterRegistration) {
    return {
      success: false,
      code: "EXPORTER_NOT_IMPLEMENTED",
      error: "exporter_not_implemented",
      message: `No exporter is implemented for ${resolvedDocType} in ${resolvedCountry} with format "${resolvedFormat}".`,
      documentType: resolvedDocType,
      country: resolvedCountry,
      format: resolvedFormat,
    };
  }

  // 7. Execute Exporter (Canonical document only, NO DOM scraping)
  try {
    const exportResult = exporterRegistration.handler(doc, {
      documentType: resolvedDocType,
      country: resolvedCountry,
      format: resolvedFormat,
      validationResult: validation,
      ...extraOpts,
    });

    return {
      success: true,
      documentType: resolvedDocType,
      country: resolvedCountry,
      format: resolvedFormat,
      exporter: exporterRegistration.id,
      ...exportResult,
    };
  } catch (err) {
    return {
      success: false,
      code: "EXPORT_FAILED",
      error: "export_failed",
      message: `Export execution failed: ${err.message}`,
      documentType: resolvedDocType,
      country: resolvedCountry,
      format: resolvedFormat,
    };
  }
}

/**
 * Backward compatibility adapter for routeExport(canonical, opts)
 * Preserves legacy interface used by older scripts/tests.
 */
export async function routeExport(canonical, opts = {}) {
  const {
    country = canonical?.country || "QA",
    docType = canonical?.documentType || "invoice",
    documentType = docType,
    format = "json",
    rules,
    validationResult,
  } = opts;

  return exportDocument({
    document: canonical,
    country,
    documentType,
    format,
    rules,
    validationResult,
  });
}

export default {
  exportDocument,
  routeExport,
  SUPPORTED_DOC_TYPES,
  SUPPORTED_COUNTRIES,
  normalizeCountry,
  normalizeDocType,
  normalizeFormat,
};
