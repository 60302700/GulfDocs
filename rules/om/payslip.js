/**
 * rules/om/payslip.js
 *
 * Country: Oman (OM)
 * Document Type: payslip
 * Authority: Oman Tax Authority (OTA)
 *
 * Oman WPS requires salary payment through approved channels. Full WPS integration not implemented.
 *
 * DISCLAIMER: Oman VAT is 5% (effective April 2021). Oman's Fawtara e-invoicing system is under development. PDF generation alone does not satisfy Fawtara structured e-invoice exchange.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "OM",
        country_name: "Oman",
        document_type: "payslip",
        currency: "OMR",
        vat_rate: 0.05,
        has_vat: true,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "employer.name",
        "employee.name",
        "payPeriod",
        "grossPay",
        "netPay"
],
        warning_fields: [
        "employee.id",
        "payment.bankAccount.bankName"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "OM_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Oman Tax Authority (OTA)",
                "sourceTitle": "Oman Labour Law \u2014 Royal Decree No. 35 of 2003 (as amended); WPS (Ministry of Labour)",
                "sourceUrl": "https://mol.gov.om/",
                "version": "2026-09",
                "publishedDate": "2003-04-16",
                "effectiveDate": "2003-04-16",
                "lastVerified": "2026-09-01",
                "notes": "Oman WPS requires salary payment through approved channels. Full WPS integration not implemented."
        }
],
        customValidate,
    };
}
