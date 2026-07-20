import re

with open('scripts.js', 'r') as f:
    text = f.read()

# Helper function
helper = """
// Helper to get the iframe DOM
function getIframeDOM() {
    let iframe = document.getElementById('document-canvas');
    return iframe ? (iframe.contentDocument || iframe.contentWindow.document) : null;
}
"""

# Replace the updateInvoice content completely
update_func_start = text.find('function updateInvoice()')
update_func_end = text.find('}\nupdateInvoice();', update_func_start) + 1

new_update = """function updateInvoice() {
    let iframeDoc = getIframeDOM();
    if (!iframeDoc) return;
    
    // Helper to safely set text content
    const setText = (id, val) => {
        let el = iframeDoc.getElementById(id);
        if (el) el.textContent = val;
    };

    setText('out-brand', document.getElementById('in-company')?.value || '{Brand Name}');
    setText('out-city', document.getElementById('in-city')?.value || '{City}');
    setText('out-country', document.getElementById('in-country')?.value || '{Country}');
    setText('out-trn', document.getElementById('in-trn')?.value || '{VAT/TRN}');
    setText('out-biz-phone', document.getElementById('in-biz-phone')?.value || '{Phone}');
    setText('out-invoice-num', document.getElementById('in-number')?.value || '{Invoice #}');
    setText('out-order-id', document.getElementById('in-order-id')?.value || '{Order ID}');
    setText('out-date', document.getElementById('in-date')?.value || '{Date}');
    setText('out-time', document.getElementById('in-time')?.value || '{Time}');
    
    setText('out-client', document.getElementById('in-client')?.value || '{Name}');
    setText('out-cust-address', document.getElementById('in-cust-address')?.value || '{Address}');
    setText('out-pay-method', document.getElementById('in-pay-method')?.value || '{Payment Method}');
    setText('out-del-type', document.getElementById('in-del-type')?.value || '{Delivery Type}');
    setText('out-del-fee', document.getElementById('in-del-fee')?.value || '{Delivery Fee}');
    setText('out-discount', '-' + (document.getElementById('in-discount')?.value || '{Discount}'));
}
"""

text = text[:update_func_start] + helper + new_update + text[update_func_end:]

# But wait, initially we need to set the iframe HTML ONCE!
# I should do that.
init_html = """
// Function to initialize iframe ONCE
function initIframe() {
    let doc = document.getElementById('document-canvas');
    if (doc) {
        doc.srcdoc = getInvoiceHTML();
        // Wait for it to load, then we can update normally
        doc.onload = () => {
             updateInvoice();
        };
    }
}
initIframe();
"""
text = text.replace('updateInvoice();\n\nfunction additems()', init_html + '\nfunction additems()')


with open('scripts.js', 'w') as f:
    f.write(text)
