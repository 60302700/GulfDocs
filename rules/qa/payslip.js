/**
 * rules/qa/payslip.js
 *
 * Country: Qatar (QA)
 * Document Type: payslip
 * Authority: Qatar Tax Authority (QTA) / Ministry of Finance Qatar
 *
 * Qatar operates a Wage Protection System (WPS). Payslip compliance with WPS requires additional fields beyond basic employer/employee info.
 *
 * DISCLAIMER: Qatar does not currently impose Value Added Tax. Regulatory requirements are based on the Qatar Commercial Law (Law No. 27/2006) and Qatar Tax Authority guidance.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "QA",
        country_name: "Qatar",
        document_type: "payslip",
        currency: "QAR",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "employer.name",
        "employee.name",
        "employee.id",
        "payPeriod",
        "grossPay",
        "netPay"
],
        warning_fields: [
        "payment.bankAccount.bankName"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "QA_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Qatar Tax Authority (QTA) / Ministry of Finance Qatar",
                "sourceTitle": "Qatar Labor Law No. 14 of 2004 and Wage Protection System",
                "sourceUrl": "https://www.mec.gov.qa/",
                "version": "2026-09",
                "publishedDate": "2004-01-01",
                "effectiveDate": "2004-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Qatar operates a Wage Protection System (WPS). Payslip compliance with WPS requires additional fields beyond basic employer/employee info."
        }
],
        customValidate,
    };
}
