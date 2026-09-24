export const GCC_COUNTRIES = {
  QA: {
    code: "QA",
    name: "Qatar",
    currency: "QAR",
    vatRate: 0.05,
    rulesStatus: "APPLICATION_VALIDATED",
    notes:
      "Qatar rules are configured as country-aware defaults; final official e-invoice requirements remain pending verification.",
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    vatRate: 0.05,
    rulesStatus: "APPLICATION_VALIDATED",
    notes:
      "UAE VAT invoice rules are kept separate from structured e-invoice requirements.",
  },
  SA: {
    code: "SA",
    name: "Saudi Arabia",
    currency: "SAR",
    vatRate: 0.15,
    rulesStatus: "APPLICATION_VALIDATED",
    notes:
      "Saudi rules are isolated and limited to application validation; ZATCA structured e-invoice logic remains separate.",
  },
  BH: {
    code: "BH",
    name: "Bahrain",
    currency: "BHD",
    vatRate: 0.05,
    rulesStatus: "APPLICATION_VALIDATED",
    notes:
      "Bahrain rules remain country-specific and are not inherited from Saudi or UAE requirements.",
  },
  KW: {
    code: "KW",
    name: "Kuwait",
    currency: "KWD",
    vatRate: 0.05,
    rulesStatus: "APPLICATION_VALIDATED",
    notes:
      "Kuwait rules are separated from other GCC countries and clearly marked as currently validated at application level.",
  },
  OM: {
    code: "OM",
    name: "Oman",
    currency: "OMR",
    vatRate: 0.05,
    rulesStatus: "APPLICATION_VALIDATED",
    notes:
      "Oman rules are configured as a country-specific package and do not reuse UAE or Saudi logic.",
  },
};

export const DOCUMENT_TYPES = {
  invoice: {
    required_fields: [
      "seller.legal_name",
      "seller.tax_id",
      "invoice_number",
      "issue_date",
      "line_items",
      "grand_total",
    ],
    warnings: ["payment.method"],
    defaultTransactionType: "B2B",
    status: "APPLICATION_VALIDATED",
  },
  payslip: {
    required_fields: [
      "seller.legal_name",
      "employee.name",
      "pay_period",
      "gross_salary",
      "net_salary",
    ],
    warnings: ["payment.method"],
    defaultTransactionType: "EMPLOYEE",
    status: "APPLICATION_VALIDATED",
  },
  quotation: {
    required_fields: [
      "seller.legal_name",
      "buyer.legal_name",
      "quote_number",
      "issue_date",
      "line_items",
      "grand_total",
    ],
    warnings: ["payment.terms"],
    defaultTransactionType: "B2B",
    status: "APPLICATION_VALIDATED",
  },
  purchase_order: {
    required_fields: [
      "seller.legal_name",
      "buyer.legal_name",
      "po_number",
      "issue_date",
      "line_items",
      "grand_total",
    ],
    warnings: ["delivery_terms"],
    defaultTransactionType: "B2B",
    status: "APPLICATION_VALIDATED",
  },
  billing_details: {
    required_fields: [
      "beneficiary.name",
      "bank.name",
      "currency",
      "amount",
      "payment.reference",
    ],
    warnings: ["payment.instructions"],
    defaultTransactionType: "BANKING",
    status: "APPLICATION_VALIDATED",
  },
};

export function getRules({
  country = "QA",
  documentType = "invoice",
  issueDate = new Date().toISOString().slice(0, 10),
  transactionType = "B2B",
} = {}) {
  const countryConfig = GCC_COUNTRIES[country] || GCC_COUNTRIES.QA;
  const doc = DOCUMENT_TYPES[documentType] || DOCUMENT_TYPES.invoice;

  return {
    country: countryConfig.code,
    country_name: countryConfig.name,
    document_type: documentType,
    version: "2026-09",
    effective_from: issueDate,
    currency: countryConfig.currency,
    vat_rate: countryConfig.vatRate,
    transaction_type: transactionType,
    status: doc.status,
    required_fields: doc.required_fields,
    warnings: doc.warnings,
    source_registry: [
      {
        country: countryConfig.code,
        authority: "GCC national authority / tax portal",
        requirement: `${documentType} validation`,
        source_title: "Official country tax or commercial documentation",
        official_url: "Pending official URL verification",
        status: "PENDING_VERIFICATION",
      },
    ],
    notes: countryConfig.notes,
  };
}

export default { GCC_COUNTRIES, DOCUMENT_TYPES, getRules };
