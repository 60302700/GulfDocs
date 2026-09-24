/**
 * rules/kw/payslip.js
 *
 * Country: Kuwait (KW)
 * Document Type: payslip
 * Authority: Kuwait Ministry of Finance / General Administration of Customs
 *
 * [CURRENT] Kuwait WPS requires salary payment through approved financial channels. Full WPS integration not implemented.
 *
 * DISCLAIMER: Kuwait does not currently impose VAT (as of 2026). A GCC-wide VAT framework was agreed upon but Kuwait has not enacted domestic VAT legislation. Rules reflect CURRENT requirements only.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "KW",
        country_name: "Kuwait",
        document_type: "payslip",
        currency: "KWD",
        vat_rate: 0.0,
        has_vat: false,
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
        "employee.id"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "KW_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Kuwait Ministry of Finance / General Administration of Customs",
                "sourceTitle": "Kuwait Labour Law \u2014 Law No. 6 of 2010; WPS (Ministry of Social Affairs and Labour)",
                "sourceUrl": "https://www.msal.gov.kw/",
                "version": "2026-09",
                "publishedDate": "2010-01-01",
                "effectiveDate": "2010-01-01",
                "lastVerified": "2026-09-01",
                "notes": "[CURRENT] Kuwait WPS requires salary payment through approved financial channels. Full WPS integration not implemented."
        }
],
        customValidate,
    };
}
