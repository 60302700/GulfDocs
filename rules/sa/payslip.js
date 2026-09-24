/**
 * rules/sa/payslip.js
 *
 * Country: Saudi Arabia (SA)
 * Document Type: payslip
 * Authority: Zakat, Tax and Customs Authority (ZATCA)
 *
 * Saudi WPS (Wage Protection System) requires salary payment through approved channels and monthly reporting. Full WPS compliance requires HRSD-approved integration not implemented.
 *
 * DISCLAIMER: Saudi Arabia operates ZATCA e-invoicing (Fatoorah). Phase 1 (generation) and Phase 2 (integration) are progressive requirements. This application generates PDF-level invoices only. Government clearance/reporting is NOT implemented.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "SA",
        country_name: "Saudi Arabia",
        document_type: "payslip",
        currency: "SAR",
        vat_rate: 0.15,
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
                "code": "SA_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Zakat, Tax and Customs Authority (ZATCA)",
                "sourceTitle": "Saudi Labour Law (Royal Decree No. M/51 of 23/8/1426H) and WPS (Ministry of Human Resources)",
                "sourceUrl": "https://www.hrsd.gov.sa/",
                "version": "2026-09",
                "publishedDate": "2005-09-27",
                "effectiveDate": "2005-09-27",
                "lastVerified": "2026-09-01",
                "notes": "Saudi WPS (Wage Protection System) requires salary payment through approved channels and monthly reporting. Full WPS compliance requires HRSD-approved integration not implemented."
        }
],
        customValidate,
    };
}
