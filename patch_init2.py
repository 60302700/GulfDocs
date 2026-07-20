import re

with open('scripts.js', 'r') as f:
    text = f.read()

text = re.sub(r'doc\.onload = \(\) => \{\s+updateInvoice\(\);\s+\};', 'doc.onload = () => {\n            updateInvoice();\n            let container = document.getElementById("items-container");\n            if (container && container.children.length === 0) {\n                additems();\n            }\n        };', text)

with open('scripts.js', 'w') as f:
    f.write(text)
