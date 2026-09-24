/**
 * rules/ae/payslip.js
 *
 * Country: United Arab Emirates (AE)
 * Document Type: payslip
 * Authority: Federal Tax Authority (FTA) — UAE
 *
 * UAE Wage Protection System (WPS) mandates salary disbursement via approved agents. Full WPS compliance requires MOHRE-approved payroll agent integration not yet implemented.
 *
 * DISCLAIMER: UAE VAT was introduced on 1 January 2018 at 5%. E-invoicing (Haytek) is under development. Rules reflect FTA published VAT invoice requirements.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "AE",
        country_name: "United Arab Emirates",
        document_type: "payslip",
        currency: "AED",
        vat_rate: 0.05,
        has_vat: true,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "employer.name",
        "employee.name",
        "employee.id",
        "payPeriod",
        "grossPay",
        "netPay",
        "currency.code"
],
        warning_fields: [
        "payment.bankAccount.bankName"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "AE_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Federal Tax Authority (FTA) \u2014 UAE",
                "sourceTitle": "UAE Labour Law \u2014 Federal Law No. 8 of 1980 (as amended) / Federal Decree-Law No. 33 of 2021; WPS (MOHRE)",
                "sourceUrl": "https://www.mohre.gov.ae/",
                "version": "2026-09",
                "publishedDate": "2021-09-20",
                "effectiveDate": "2022-02-02",
                "lastVerified": "2026-09-01",
                "notes": "UAE Wage Protection System (WPS) mandates salary disbursement via approved agents. Full WPS compliance requires MOHRE-approved payroll agent integration not yet implemented."
        }
],
        customValidate,
    };
}
