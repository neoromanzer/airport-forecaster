import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const htmlPath = join(distDir, 'index.html');
let html = readFileSync(htmlPath, 'utf-8');

// Resolve a relative or absolute asset href to a path inside distDir
function assetPath(href) {
  return join(distDir, href.replace(/^\.?\//, ''));
}

// Inline <link rel="icon"> favicons as data URIs
html = html.replace(/<link([^>]*)\shref="([^"]+)"([^>]*)\/?>/g, (match, before, href, after) => {
  const allAttrs = before + after;
  if (!/rel="icon"/.test(allAttrs)) return match;
  if (/^(https?:)?\/\//.test(href)) return match; // skip external
  const filePath = assetPath(href);
  if (!existsSync(filePath)) { console.warn('postbuild: not found:', filePath); return match; }
  const data = readFileSync(filePath);
  const mime = href.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
  const b64 = data.toString('base64');
  return match.replace(href, `data:${mime};base64,${b64}`);
});

// Inline <link rel="stylesheet" href="..."> as <style> tags
html = html.replace(/<link([^>]*)\shref="([^"]+)"([^>]*)\/?>/g, (match, before, href, after) => {
  if (!/rel="stylesheet"/.test(before + after)) return match;
  if (/^(https?:)?\/\//.test(href)) return match; // skip external
  const filePath = assetPath(href);
  if (!existsSync(filePath)) { console.warn('postbuild: not found:', filePath); return match; }
  const css = readFileSync(filePath, 'utf-8');
  return `<style>${css}</style>`;
});

// Inline <script src="..."> — remove from current position, collect code
const scripts = [];
html = html.replace(/<script\b([^>]*)\bsrc="([^"]+)"([^>]*)>\s*<\/script>/g, (match, before, src, after) => {
  if (/^(https?:)?\/\//.test(src)) return match; // skip external
  const filePath = assetPath(src);
  if (!existsSync(filePath)) { console.warn('postbuild: not found:', filePath); return match; }
  scripts.push(readFileSync(filePath, 'utf-8'));
  return '';
});

// Collect any already-inline <script> blocks (strip type="module"/crossorigin)
html = html.replace(/<script(?:\s[^>]*)?>([^]*?)<\/script>/g, (match, code) => {
  if (code.trim()) { scripts.push(code); return ''; }
  return match;
});

// Place all scripts just before </body>.
// IMPORTANT: use a replacer function, not a replacement string, so that
// $` $' $& etc. inside the JS bundle are not interpreted as replace() patterns.
if (scripts.length > 0) {
  const tag = scripts.map(s => `<script>${s}</script>`).join('\n');
  html = html.replace('</body>', () => `${tag}\n  </body>`);
}

writeFileSync(htmlPath, html);
console.log(`postbuild: inlined ${scripts.length} script(s) — dist/index.html is self-contained`);
