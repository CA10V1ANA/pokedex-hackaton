const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'dist', 'pokedex-hackaton', 'browser', 'index.html');
const dest = path.join(__dirname, '..', 'dist', 'pokedex-hackaton', 'browser', '404.html');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Successfully created 404.html for GitHub Pages SPA routing.');
} else {
  console.warn('dist index.html not found, skipping 404.html copy.');
}
