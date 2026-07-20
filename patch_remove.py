with open('scripts.js', 'r') as f:
    text = f.read()

# Fix the button in additems
text = text.replace('onclick="removeitems()"', 'onclick="removeitems(${index})"')

# Fix removeitems function
old_remove = """function removeitems() {
    let container = document.getElementById("items-container");
    if (container.lastElementChild) {
        container.removeChild(container.lastElementChild);
    }
    
    let iframeDoc = getIframeDOM();
    if (iframeDoc) {
        let tbody = iframeDoc.getElementById('item-box-invoice');
        if (tbody && tbody.lastElementChild) {
            tbody.removeChild(tbody.lastElementChild);
        }
    }
}"""

new_remove = """function removeitems(index) {
    let container = document.getElementById("items-container");
    let itemRow = document.getElementById(`item-row-${index}`);
    if (itemRow) container.removeChild(itemRow);
    
    let iframeDoc = getIframeDOM();
    if (iframeDoc) {
        let iframeRow = iframeDoc.getElementById(`iframe-row-${index}`);
        if (iframeRow) iframeRow.parentNode.removeChild(iframeRow);
    }
}"""

text = text.replace(old_remove, new_remove)

with open('scripts.js', 'w') as f:
    f.write(text)
