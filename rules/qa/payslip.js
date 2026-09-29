/**
 * rules/qa/payslip.js
 *
 * Country: Qatar (QA)
 * Document Type: payslip
 * Authority: Ministry of Labour (MOL) — Qatar
 *
 * Qatar Wage Protection System (WPS) mandates electronic salary transfer via Qatar Central Bank clearing. Full WPS compliance requires SIF file generation and approved Qatari bank integration.
 *
 * DISCLAIMER: Qatar payroll requirements are governed by Qatar Labour Law (Law No. 14 of 2004) and Law No. 1 of 2015 on the Wage Protection System.
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
            "netPay",
            "currency.code"
        ],
        warning_fields: [
            "payment.bankAccount.bankName"
        ],
        extra_rules: [
            {
                code: "QA_WPS_SIF_REQUIREMENT",
                description: "Qatar WPS requires electronic salary information file (.SIF) upload through QCB-cleared banks",
                status: "NOT_YET_IMPLEMENTED",
                field: "payment",
                authority: "Ministry of Labour (MOL) — Qatar",
                sourceTitle: "Qatar Labour Law Amendments (Law No. 1 of 2015 on WPS)",
                sourceUrl: "https://www.mol.gov.qa/",
                effectiveDate: "2015-11-02",
                notes: "Standard PDF payslip does not substitute for Ministry of Labour / QCB electronic SIF submission."
            }
        ],
        source_registry: [
            {
                "code": "QA_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Ministry of Labour (MOL) — Qatar",
                "sourceTitle": "Qatar Labour Law No. 14 of 2004 and Wage Protection System (Law No. 1 of 2015)",
                "sourceUrl": "https://www.mol.gov.qa/",
                "version": "2026-09",
                "publishedDate": "2015-02-18",
                "effectiveDate": "2015-11-02",
                "lastVerified": "2026-09-01",
                "notes": "Qatar operates a Wage Protection System (WPS). Payslip compliance with WPS requires additional fields beyond basic employer/employee info."
            }
        ],
        customValidate,
    };
}
