const fs = require('fs');
const path = require('path');

const srcDir = './frontend/src';

const colorMap = {
    // Backgrounds
    '#ffffff': 'var(--bg-card)',
    '#fff': 'var(--bg-card)',
    '#f9fafb': 'var(--bg-main)',
    '#f3f4f6': 'var(--bg-hover)',
    '#f1f5f9': 'var(--bg-hover)',
    '#e2e8f0': 'var(--border-color)',
    '#eee': 'var(--border-color)',
    
    // Borders
    '#e5e7eb': 'var(--border-color)',
    '#d1d5db': 'var(--border-color-dark)',
    '#ccc': 'var(--border-color-dark)',
    
    // Text
    '#111827': 'var(--text-primary)',
    '#1f2937': 'var(--text-secondary)',
    '#374151': 'var(--text-secondary)',
    '#4b5563': 'var(--text-muted)',
    '#475569': 'var(--text-muted)',
    '#6b7280': 'var(--text-muted)',
    '#9ca3af': 'var(--text-placeholder)',
    
    // Primary / Indigo / Blue
    '#312e81': 'var(--primary-dark)',
    '#2563eb': 'var(--primary)',
    '#1d4ed8': 'var(--primary-hover)',
    '#1e40af': 'var(--primary-hover)',
    '#1e3a8a': 'var(--primary-dark)',
    '#3b82f6': 'var(--primary-light)',
    '#bfdbfe': 'var(--primary-bg)',
    '#dbeafe': 'var(--primary-bg)',
    '#eff6ff': 'var(--primary-bg)',
    '#e0e7ff': 'var(--primary-bg)',
    
    // Success / Green
    '#10b981': 'var(--success)',
    '#22c55e': 'var(--success)',
    '#047857': 'var(--success-text)',
    '#065f46': 'var(--success-text)',
    '#ecfdf5': 'var(--success-bg)',
    '#d1fae5': 'var(--success-bg)',
    '#a7f3d0': 'var(--success-bg)',
    '#bbf7d0': 'var(--success-bg)',
    '#f0fdf4': 'var(--success-bg)',
    
    // Danger / Red
    '#ef4444': 'var(--danger)',
    '#b91c1c': 'var(--danger-text)',
    '#991b1b': 'var(--danger-text)',
    '#fef2f2': 'var(--danger-bg)',
    '#fecaca': 'var(--danger-bg)',
    
    // Warning / Yellow / Orange
    '#eab308': 'var(--warning)',
    '#f59e0b': 'var(--warning)',
    '#b45309': 'var(--warning-text)',
    '#92400e': 'var(--warning-text)',
    '#c2410c': 'var(--warning-text)',
    '#fef3c7': 'var(--warning-bg)',
    '#fed7aa': 'var(--warning-bg)',
    '#fde68a': 'var(--warning-bg)',
    '#fff7ed': 'var(--warning-bg)',
    
    // Misc
    '#7e22ce': 'var(--purple)',
    '#faf5ff': 'var(--purple-bg)',
    '#e9d5ff': 'var(--purple-bg)',
    
    // Black
    '#000': 'var(--text-primary)',
    '#000000': 'var(--text-primary)'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scanAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // For each color, replace it
            for (const [hex, cssVar] of Object.entries(colorMap)) {
                // regex with word boundary equivalent for hex colors, case insensitive
                const regex = new RegExp(escapeRegExp(hex) + '(?![0-9a-fA-F])', 'gi');
                content = content.replace(regex, cssVar);
            }
            
            // Also handle rgba() cases like rgba(0, 0, 0, 0.1) which might need variables in dark mode
            // Actually, we can leave rgba(0,0,0,x) as is for box-shadows, as they usually look ok, 
            // but for a truly premium dark mode we might need to adjust shadows.
            
            fs.writeFileSync(fullPath, content, 'utf8');
        }
    }
}

scanAndReplace(srcDir);
console.log("Colors replaced!");
