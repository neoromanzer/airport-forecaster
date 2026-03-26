import { readFileSync, writeFileSync } from 'fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf-8');

// Extract inline module scripts from <head> and move them to end of <body>.
// Inline scripts ignore the `defer` attribute, so leaving them in <head>
// causes them to run synchronously before <div id="root"> exists in the DOM,
// resulting in a blank page. Moving to end of <body> ensures the DOM is ready.
const scripts = [];
html = html
  .replace(/<script type="module" crossorigin>([\s\S]*?)<\/script>/g, (_, content) => {
    scripts.push(`<script>${content}</script>`);
    return '';
  })
  .replace(/<script type="module">([\s\S]*?)<\/script>/g, (_, content) => {
    scripts.push(`<script>${content}</script>`);
    return '';
  });

if (scripts.length > 0) {
  html = html.replace('</body>', scripts.join('\n') + '\n  </body>');
}

writeFileSync(path, html);
console.log('postbuild: moved inline scripts to end of body and stripped type="module"');
