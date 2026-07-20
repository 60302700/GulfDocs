const express = require('express');
const helmet = require('helmet');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

// Security headers, including a real (HTTP-header) Content-Security-Policy.
// Kept in sync with the <meta http-equiv="Content-Security-Policy"> tag in
// each HTML page, which acts as a fallback if these pages are ever served
// from a static host instead of this Express server.
//
// 'unsafe-inline' is required for both script-src and style-src because the
// UI relies on inline onclick/oninput handlers and inline style="" attributes
// throughout - removing it would break the app without a larger refactor to
// addEventListener-based event binding. This means CSP here is defense in
// depth against *injected* <script> tags from third-party sources, not a
// full XSS mitigation.
//
// When Google AdSense is enabled, extend script-src/frame-src/connect-src/
// img-src with the ad network's required origins (e.g.
// https://pagead2.googlesyndication.com, https://googleads.g.doubleclick.net,
// https://*.googlesyndication.com) - see Google's AdSense CSP docs.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        },
    },
}));

// Configure Handlebars as the view engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: false, // We're using full HTML pages in our templates
    helpers: {
        // Helper for 1-based index (used in purchase-order template)
        index1: function (options) {
            return options.data.index + 1;
        }
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'templates'));

// --- Dummy Data ---
const dummyData = {
    invoice: {
        brandName: "Al Noor Trading LLC",
        city: "Dubai",
        country: "UAE",
        vatTRN: "100234567890003",
        email: "sales@alnoortrading.ae",
        phone: "+971 4 234 5678",
        invoiceNumber: "INV-2025-0892",
        date: "08 May 2025",
        orderID: "ORD-78812",
        time: "11:42 AM",
        customer: {
            name: "Mohammed Al Rashidi",
            phone: "+974 5512 3344",
            email: "m.rashidi@example.com",
            address: "Villa 14, Al Waab Street, Doha, Qatar"
        },
        paymentMethod: "Visa Card",
        deliveryType: "Home Delivery",
        cardRef: "REF-8821-XXXX",
        store: "Al Noor - Downtown Branch",
        items: [
            { product: "Samsung 65\" QLED 4K TV", pk: "1 Unit", sku: "SAM-65Q80C", qty: 1, unitPrice: "QAR 6,200", vat: "QAR 310", total: "QAR 6,510" },
            { product: "Sony PlayStation 5 Console", pk: "1 Bundle", sku: "SONY-PS5-DIG", qty: 2, unitPrice: "QAR 2,100", vat: "QAR 210", total: "QAR 4,410" },
            { product: "Apple AirPods Pro (2nd Gen)", pk: "1 Box", sku: "APP-AIRP2", qty: 3, unitPrice: "QAR 950", vat: "QAR 142.50", total: "QAR 2,992.50" }
        ],
        subtotal: "QAR 13,250",
        vatAmount: "QAR 662.50",
        deliveryFee: "QAR 0.00",
        discount: "QAR 500",
        grandTotal: "QAR 13,412.50",
        orderStatus: "Delivered",
        compliance: "GCC VAT Compliant — TRN 100234567890003",
        warehouse: "DXB-MAIN",
        source: "POS-DT",
        storeID: "ST-009",
        shipmentType: "Last Mile"
    },

    payslip: {
        companyName: "Horizon Tech Solutions",
        registrationNumber: "CR-2019-00142",
        month: "April",
        year: "2025",
        employee: {
            name: "Sara Al Mansoori",
            id: "EMP-0254",
            position: "Senior Software Engineer",
            bankName: "Qatar National Bank (QNB)",
            iban: "QA58QNBA000000012345678901234",
            department: "Engineering / R&D",
            leaveBalance: "18"
        },
        earnings: [
            { item: "Basic Salary", amount: "8,500.00" },
            { item: "Housing Allowance", amount: "2,000.00" },
            { item: "Transport Allowance", amount: "800.00" },
            { item: "Food Allowance", amount: "500.00" },
            { item: "Performance Bonus (Q1)", amount: "1,200.00" }
        ],
        deductions: [
            { item: "GOSI / Social Security", amount: "510.00" },
            { item: "Absence Deduction (1 Day)", amount: "283.33" },
            { item: "Loan Repayment", amount: "500.00" }
        ],
        totalEarnings: "13,000.00",
        totalDeductions: "1,293.33",
        netPay: "11,706.67",
        generatedDate: "30 April 2025",
        generatedTime: "09:00 AM"
    },

    "purchase-order": {
        buyer: {
            companyName: "Falcon Supplies WLL",
            poBox: "P.O. Box 4412",
            city: "Doha",
            country: "Qatar",
            trn: "5003012345600003",
            phone: "+974 4412 8800",
            email: "procurement@falconsupplies.qa"
        },
        poNumber: "PO-2025-0341",
        date: "08 May 2025",
        expectedDate: "22 May 2025",
        vendor: {
            name: "Gulf Office Systems Co.",
            address: "Salwa Rd, Industrial Area, Doha",
            contactPerson: "Mr. Tariq Al Hassan",
            trn: "5001009988700003",
            phone: "+974 4465 2211"
        },
        shipTo: {
            warehouseName: "Falcon Central Warehouse",
            address: "Zone 81, Street 600, Industrial Area, Doha",
            receiverName: "Ahmed Al Khanji",
            phone: "+974 5567 8899"
        },
        shipping: {
            incoterms: "DDP (Delivered Duty Paid)",
            carrier: "DHL Express Qatar",
            paymentTerms: "Net 30 Days",
            prRef: "PR-2025-0089"
        },
        lineItems: [
            { name: "HP EliteBook 840 G10 Laptop", spec: "Intel Core i7-1365U, 16GB RAM, 512GB SSD, 14\" FHD", sku: "HP-840G10-I7", qty: 5, unitPrice: "QAR 5,800", vatPercent: "5%", lineTotal: "QAR 29,000" },
            { name: "Dell 27\" Monitor (U2723D)", spec: "4K UHD IPS, USB-C 90W, Height Adjustable Stand", sku: "DELL-U2723D", qty: 5, unitPrice: "QAR 1,650", vatPercent: "5%", lineTotal: "QAR 8,250" },
            { name: "Logitech MX Keys Business Keyboard", spec: "Wireless, Multi-Device, Backlit, Arabic/English", sku: "LOG-MXKEYSBIZ", qty: 10, unitPrice: "QAR 320", vatPercent: "5%", lineTotal: "QAR 3,200" },
            { name: "Ergonomic Office Chair (Steelcase Leap V2)", spec: "Fully adjustable, Lumbar support, 5-year warranty", sku: "STL-LEAP-V2", qty: 5, unitPrice: "QAR 2,400", vatPercent: "5%", lineTotal: "QAR 12,000" }
        ],
        subtotal: "QAR 52,450.00",
        totalVAT: "QAR 2,622.50",
        freightFees: "QAR 350.00",
        grandTotal: "QAR 55,422.50"
    },

    quotation: {
        company: {
            name: "Vertex Digital Solutions",
            trn: "5004122334455000",
            city: "Doha",
            country: "Qatar",
            email: "info@vertexdigi.qa",
            phone: "+974 4478 9900",
            website: "www.vertexdigi.qa",
            address: "West Bay, Tower 3, Floor 12, Doha, Qatar"
        },
        quoteID: "QT-2025-0112",
        date: "08 May 2025",
        expiryDate: "08 June 2025",
        preparedBy: "Khalid Bin Saad",
        client: {
            companyName: "Majlis Properties LLC",
            contactPerson: "Eng. Nora Al Thani",
            address: "Al Dafna District, Doha, Qatar",
            phone: "+974 5523 4411"
        },
        project: {
            name: "Office Digital Infrastructure Upgrade — Phase 1",
            duration: "6–8 Weeks",
            paymentTerms: "40% Advance, 60% on Completion"
        },
        lineItems: [
            { title: "Structured Network Cabling (Cat6A)", description: "Full office cabling for 50 workstations including patch panels, trunking, and labelling as per TIA-568 standard.", qty: 1, unitPrice: "QAR 18,000", lineTotal: "QAR 18,000" },
            { title: "Wireless Access Point Installation (Cisco Meraki MR46)", description: "Supply and install 8x enterprise-grade Wi-Fi 6 access points with cloud management license (1 year).", qty: 8, unitPrice: "QAR 2,200", lineTotal: "QAR 17,600" },
            { title: "Cybersecurity Firewall (FortiGate 100F)", description: "Supply, rack-mount, and configure NGFw with IPS, web filtering, and VPN. Includes 1-year UTM subscription.", qty: 1, unitPrice: "QAR 12,500", lineTotal: "QAR 12,500" },
            { title: "IT Project Management & Site Supervision", description: "Dedicated project manager for full duration. Includes documentation, handover report, and staff training session.", qty: 1, unitPrice: "QAR 8,000", lineTotal: "QAR 8,000" }
        ],
        validDays: "30",
        warrantyPeriod: "12 Months",
        subtotal: "QAR 56,100.00",
        vatAmount: "QAR 2,805.00",
        discountPercent: "5",
        discount: "QAR 2,805.00",
        grandTotal: "QAR 56,100.00"
    },

    "billing-details": {
        refNumber: "BD-2025-0561",
        paymentStatus: "Pending",
        client: {
            companyName: "Crescent Medical Supplies Co.",
            trn: "5002011223300003",
            contactName: "Mr. Faisal Al Sulaiti",
            email: "faisal@crescentmed.qa"
        },
        issueDate: "01 May 2025",
        dueDate: "31 May 2025",
        paymentTerm: "Net 30",
        paymentMethod: "Bank Transfer",
        bank: {
            name: "Qatar National Bank (QNB)",
            beneficiary: "Vertex Digital Solutions W.L.L.",
            swift: "QNBAQAQA",
            iban: "QA58QNBA000000012345678901234",
            currency: "QAR / USD"
        },
        items: [
            { name: "Annual IT Support Contract — Tier 2", qty: 1, rate: "QAR 24,000", vatPercent: "5%", total: "QAR 25,200" },
            { name: "Cloud Backup Service (500 GB, 12 Months)", qty: 1, rate: "QAR 3,600", vatPercent: "5%", total: "QAR 3,780" },
            { name: "On-Site Engineer Visits (4 Visits)", qty: 4, rate: "QAR 850", vatPercent: "5%", total: "QAR 3,570" }
        ],
        subtotal: "QAR 28,450.00",
        taxableAmount: "QAR 28,450.00",
        totalVAT: "QAR 1,422.50",
        grandTotal: "QAR 29,872.50",
        uniqueID: "TXN-BD2025-0561-B"
    }
};

// Serve static files from the root directory (excluding index.html as homepage)
app.use(express.static(__dirname, { index: false }));

// --- Routes ---

app.get('/custom-template', (req, res) => {
    res.sendFile(path.join(__dirname, 'custom-template.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/invoice', (req, res) => {
    res.render('invoice', dummyData.invoice);
});

app.get('/payslip', (req, res) => {
    res.render('payslip', dummyData.payslip);
});

app.get('/purchase-order', (req, res) => {
    res.render('purchase-order', dummyData['purchase-order']);
});

app.get('/quotation', (req, res) => {
    res.render('quotation', dummyData.quotation);
});

app.get('/billing-details', (req, res) => {
    res.render('billing-details', dummyData['billing-details']);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
