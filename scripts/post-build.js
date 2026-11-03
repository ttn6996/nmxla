import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const docsDir = path.resolve(rootDir, 'docs');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

console.log('--- Post-build processing ---');

// 1. Ensure dist/index.html exists (if built from dev.html)
if (fs.existsSync(path.join(distDir, 'dev.html'))) {
  fs.copyFileSync(path.join(distDir, 'dev.html'), path.join(distDir, 'index.html'));
  fs.unlinkSync(path.join(distDir, 'dev.html'));
  console.log('Renamed dist/dev.html -> dist/index.html');
}

// 2. Create 404.html in dist
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
  console.log('Created dist/404.html');
}

// 3. Ensure .nojekyll in dist
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('Created dist/.nojekyll');

// 4. Sync dist to docs/
copyFolderSync(distDir, docsDir);
console.log('Synced dist/ to docs/');

// 5. Sync production files to root for instant GitHub Pages root support
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(rootDir, 'index.html'));
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(rootDir, '404.html'));
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');
if (fs.existsSync(path.join(distDir, 'assets'))) {
  copyFolderSync(path.join(distDir, 'assets'), path.join(rootDir, 'assets'));
}
console.log('Synced production index.html and assets/ to repository root');
console.log('--- Post-build complete! ---');
