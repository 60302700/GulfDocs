import re

with open('scripts.js', 'r') as f:
    text = f.read()

# Replace let index = container.children.length; with global counter
if 'let itemCounter =' not in text:
    text = text.replace('function additems() {', 'let itemCounter = 0;\nfunction additems() {')

text = text.replace('let index = container.children.length; // Create a unique index based on row count', 'let index = itemCounter++; // Use global counter for true unique IDs')

with open('scripts.js', 'w') as f:
    f.write(text)
