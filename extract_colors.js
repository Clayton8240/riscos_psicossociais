const fs = require('fs');
const path = require('path');

const srcDir = './frontend/src';
const colors = new Set();
const hexRegex = /#([0-9a-fA-F]{3,6})\b/g;

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let match;
            while ((match = hexRegex.exec(content)) !== null) {
                colors.add(match[0].toLowerCase());
            }
        }
    }
}

scanDir(srcDir);
console.log(Array.from(colors).sort());
