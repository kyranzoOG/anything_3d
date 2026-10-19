import fs from 'fs';
import path from 'path';

function walk(dir, results = []) {
    let list = fs.readdirSync(dir);
    list.forEach(file => {
        let filePath = path.join(dir, file);
        let stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist')) {
                walk(filePath, results);
            }
        } else {
            if (/\.(ts|tsx|js|jsx|html|md|json|yml|yaml|css|webmanifest)$/.test(file)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

let files = walk('.');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let updated = content
        .replace(/Blockbench/g, 'Workbench')
        .replace(/blockbench/g, 'workbench')
        .replace(/BLOCKBENCH/g, 'WORKBENCH');
    if (content !== updated) {
        fs.writeFileSync(file, updated, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
console.log('Replacement complete.');
