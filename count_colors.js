const fs = require('fs');
const path = require('path');

const srcDir = './frontend/src';
const hexRegex = /#([0-9a-fA-F]{3,6})\b/g;

function scanDir(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(scanDir(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(hexRegex);
            if (matches && matches.length > 0) {
                results.push({ file: fullPath, count: matches.length });
            }
        }
    }
    return results;
}

const counts = scanDir(srcDir);
counts.sort((a, b) => b.count - a.count);
console.log(counts);
