import fs from 'fs';
import path from 'path';

const outDir = path.resolve('./_site');
if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const item of fs.readdirSync(src)) {
            copyRecursive(path.join(src, item), path.join(dest, item));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

const foldersToCopy = ['dist', 'css', 'assets', 'icons', 'lang', 'content'];
for (const folder of foldersToCopy) {
    copyRecursive(folder, path.join(outDir, folder));
}

const filesToCopy = [
    'index.html',
    'favicon.png',
    'icon.png',
    'icon_full.png',
    'icon_maskable.png',
    'manifest.webmanifest',
    'manifest-beta.webmanifest'
];
for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
        copyRecursive(file, path.join(outDir, file));
    }
}

// Bypass Jekyll processing on GitHub Pages
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

console.log('Successfully prepared static deployment directory: _site');
