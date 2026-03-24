import { readFileSync, writeFileSync } from 'fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf-8');

// Remove type="module" and crossorigin from inline script tags so the file
// works when opened directly via file:// in any browser.
html = html.replace(/<script type="module" crossorigin>/g, '<script>');
html = html.replace(/<script type="module">/g, '<script>');

writeFileSync(path, html);
console.log('postbuild: stripped type="module" from dist/index.html');
