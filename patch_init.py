with open('scripts.js', 'r') as f:
    text = f.read()

old_init = """function initIframe() {
    let doc = document.getElementById('document-canvas');
    if (doc) {
        doc.srcdoc = getInvoiceHTML();
        // Wait for it to load, then we can update normally
        doc.onload = () => {
             updateInvoice();
        };
    }
}
initIframe();"""

new_init = """function initIframe() {
    let doc = document.getElementById('document-canvas');
    if (doc) {
        doc.srcdoc = getInvoiceHTML();
        // Wait for it to load, then we can update normally
        doc.onload = () => {
             updateInvoice();
             let container = document.getElementById("items-container");
             if (container && container.children.length === 0) {
                 additems();
             }
        };
    }
}
initIframe();"""

text = text.replace(old_init, new_init)

with open('scripts.js', 'w') as f:
    f.write(text)
