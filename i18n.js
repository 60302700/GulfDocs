/**
 * i18n.js
 *
 * GCC Business Documents — Phase 5 Internationalization & Presentation Engine
 *
 * Complete bilingual (English & Arabic) dictionary, RTL layout controller,
 * GCC currency formatters, date formatters, and bidirectional text helpers.
 */

export const GCC_CURRENCIES = {
  QAR: { code: "QAR", symbol: "ر.ق", nameEn: "Qatari Riyal", nameAr: "ريال قطري", decimals: 2 },
  AED: { code: "AED", symbol: "د.إ", nameEn: "UAE Dirham", nameAr: "درهم إماراتي", decimals: 2 },
  SAR: { code: "SAR", symbol: "ر.س", nameEn: "Saudi Riyal", nameAr: "ريال سعودي", decimals: 2 },
  BHD: { code: "BHD", symbol: "د.ب", nameEn: "Bahraini Dinar", nameAr: "دينار بحريني", decimals: 3 },
  KWD: { code: "KWD", symbol: "د.ك", nameEn: "Kuwaiti Dinar", nameAr: "دينار كويتي", decimals: 3 },
  OMR: { code: "OMR", symbol: "ر.ع", nameEn: "Omani Rial", nameAr: "ريال عماني", decimals: 3 },
};

export const DICTIONARY = {
  en: {
    // Nav & Common
    appTitle: "GulfDocs — GCC Business Documents",
    language: "Language",
    english: "English",
    arabic: "العربية",
    country: "Country",
    currency: "Currency",
    docType: "Document Type",
    exportPdf: "Export PDF",
    exportJson: "Export JSON",
    exportXml: "Export XML (ZATCA)",
    print: "Print / Save PDF",
    validationResults: "Document Validation",
    validDocument: "Document passed all checks.",
    fixErrors: "Please resolve the highlighted errors before exporting.",
    
    // Document Titles
    invoiceTitle: "TAX INVOICE",
    payslipTitle: "SALARY STATEMENT / PAYSLIP",
    quotationTitle: "PRICE QUOTATION",
    purchaseOrderTitle: "PURCHASE ORDER",
    billingDetailsTitle: "BANK PAYMENT INSTRUCTIONS",

    // Invoice fields
    seller: "Seller / Supplier",
    buyer: "Buyer / Customer",
    trn: "TRN / Tax Number",
    crNumber: "CR Number",
    address: "Address",
    invoiceNumber: "Invoice #",
    invoiceDate: "Date",
    dueDate: "Due Date",
    itemDescription: "Item Description",
    qty: "Qty",
    unitPrice: "Unit Price",
    vatRate: "VAT Rate",
    vatAmount: "VAT Amount",
    lineTotal: "Total",
    subtotal: "Subtotal",
    totalTax: "Total VAT",
    grandTotal: "Grand Total",

    // Payslip fields
    employer: "Employer",
    employee: "Employee",
    employeeId: "Employee ID",
    designation: "Designation / Role",
    department: "Department",
    payPeriod: "Pay Period",
    payDate: "Pay Date",
    earnings: "Earnings",
    deductions: "Deductions",
    basicSalary: "Basic Salary",
    housingAllowance: "Housing Allowance",
    transportAllowance: "Transport Allowance",
    otherAllowance: "Other Allowances",
    socialSecurity: "Social Insurance",
    grossSalary: "Gross Salary",
    netPay: "Net Salary Payable",

    // Quotation fields
    quotationNumber: "Quotation #",
    validUntil: "Valid Until",
    preparedBy: "Prepared By",
    projectScope: "Project / Scope",
    termsConditions: "Terms & Conditions",

    // Purchase order fields
    poNumber: "Purchase Order #",
    deliveryDate: "Expected Delivery Date",
    shippingAddress: "Shipping / Delivery Address",
    shippingTerms: "Shipping Terms / Incoterms",
    paymentTerms: "Payment Terms",

    // Billing details fields
    beneficiaryName: "Beneficiary Name",
    bankName: "Bank Name",
    branch: "Branch",
    accountNumber: "Account Number",
    iban: "IBAN",
    swiftBic: "SWIFT / BIC",
    paymentReference: "Payment Reference",
    amountDue: "Amount to Transfer",
  },
  ar: {
    // Nav & Common
    appTitle: "جلف دوكس — نماذج المستندات التجارية لدول الخليج",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    country: "الدولة",
    currency: "العملة",
    docType: "نوع المستند",
    exportPdf: "تصدير PDF",
    exportJson: "تصدير JSON",
    exportXml: "تصدير XML (زاتكا)",
    print: "طباعة / حفظ كـ PDF",
    validationResults: "التحقق من صحة المستند",
    validDocument: "المستند مطابق لجميع الاشتراطات.",
    fixErrors: "يرجى تصحيح الأخطاء الموضحة أدناه قبل التصدير.",

    // Document Titles
    invoiceTitle: "فاتورة ضريبية",
    payslipTitle: "مسير رواتب / قسيمة الراتب",
    quotationTitle: "عرض أسعار",
    purchaseOrderTitle: "أمر شراء",
    billingDetailsTitle: "بيانات التحويل البنكي وتفاصيل الدفع",

    // Invoice fields
    seller: "بيانات المورد / البائع",
    buyer: "بيانات العميل / المشتري",
    trn: "الرقم الضريبي",
    crNumber: "السجل التجاري",
    address: "العنوان",
    invoiceNumber: "رقم الفاتورة",
    invoiceDate: "تاريخ الإصدار",
    dueDate: "تاريخ الاستحقاق",
    itemDescription: "وصف الصنف / الخدمة",
    qty: "الكمية",
    unitPrice: "سعر الوحدة",
    vatRate: "نسبة الضريبة",
    vatAmount: "مبلغ الضريبة",
    lineTotal: "الإجمالي",
    subtotal: "المجموع الفرعي (غير شامل الضريبة)",
    totalTax: "إجمالي ضريبة القيمة المضافة",
    grandTotal: "المبلغ الإجمالي المستحق",

    // Payslip fields
    employer: "جهة العمل / المنشأة",
    employee: "اسم الموظف",
    employeeId: "رقم الموظف / الهوية",
    designation: "المسمى الوظيفي",
    department: "القسم / الإدارة",
    payPeriod: "فترة الراتب",
    payDate: "تاريخ الصرف",
    earnings: "الاستحقاقات",
    deductions: "الاستقطاعات",
    basicSalary: "الراتب الأساسي",
    housingAllowance: "بدل سكن",
    transportAllowance: "بدل مواصلات",
    otherAllowance: "بدلات أخرى",
    socialSecurity: "التأمينات الاجتماعية",
    grossSalary: "إجمالي الراتب",
    netPay: "صافي الراتب المستحق",

    // Quotation fields
    quotationNumber: "رقم عرض السعر",
    validUntil: "تاريخ انتهاء العرض",
    preparedBy: "أعد بواسطة",
    projectScope: "نطاق العمل / المشروع",
    termsConditions: "الشروط والأحكام",

    // Purchase order fields
    poNumber: "رقم أمر الشراء",
    deliveryDate: "تاريخ التوريد المتوقع",
    shippingAddress: "عنوان التوصيل / المستودع",
    shippingTerms: "شروط الشحن (الإنكوتيرمز)",
    paymentTerms: "شروط الدفع والسداد",

    // Billing details fields
    beneficiaryName: "اسم المستفيد",
    bankName: "اسم البنك",
    branch: "الفرع",
    accountNumber: "رقم الحساب",
    iban: "رقم الآيبان (IBAN)",
    swiftBic: "رمز السويفت (SWIFT/BIC)",
    paymentReference: "مرجع التحويل / الفاتورة",
    amountDue: "المبلغ المطلوب تحويله",
  },
};

/**
 * Format a number as currency strictly respecting country decimals
 * BHD, KWD, OMR = 3 decimals
 * QAR, AED, SAR = 2 decimals
 */
export function formatCurrencyAmount(amount, currencyCode = "QAR", lang = "en") {
  const num = Number(amount) || 0;
  const curr = GCC_CURRENCIES[currencyCode] || GCC_CURRENCIES.QAR;
  const decimals = curr.decimals;
  const formattedNum = num.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const symbol = lang === "ar" ? curr.symbol : curr.code;
  return lang === "ar" ? `${formattedNum} ${symbol}` : `${symbol} ${formattedNum}`;
}

/**
 * Localized date formatter
 */
export function formatDate(dateStr, lang = "en") {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Get translated text for key
 */
export function getTranslation(key, lang = "en") {
  const dict = DICTIONARY[lang] || DICTIONARY.en;
  return dict[key] || DICTIONARY.en[key] || key;
}

/**
 * Switch page direction and update document lang
 */
export function setLanguage(lang = "en") {
  const normalized = lang === "ar" ? "ar" : "en";
  if (typeof document !== "undefined") {
    document.documentElement.lang = normalized;
    document.documentElement.dir = normalized === "ar" ? "rtl" : "ltr";
    
    // Update active body class for styling
    if (normalized === "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }

    // Dispatch event for UI components to re-render
    const event = new CustomEvent("languagechange", { detail: { lang: normalized } });
    document.dispatchEvent(event);
  }
  return normalized;
}

export default {
  GCC_CURRENCIES,
  DICTIONARY,
  getTranslation,
  formatCurrencyAmount,
  formatDate,
  setLanguage,
};
