const fs = require('fs');
const path = require('path');

console.log('=== CLIENT-MX PRODUCTION BUILD ANALYSIS ===\n');

const timestamp = new Date().toISOString();
console.log(`Analysis Date: ${timestamp}`);
console.log('');

const distPath = './dist/apps/client-mx';

const files = fs.readdirSync(distPath);
const jsFiles = files.filter((f) => f.endsWith('.js'));
const cssFiles = files.filter((f) => f.endsWith('.css'));

console.log('=== ASSET SIZES ===');

let totalSize = 0;
const fileStats = [];

jsFiles.forEach((file) => {
  const stats = fs.statSync(path.join(distPath, file));
  fileStats.push({ name: file, size: stats.size, type: 'js' });
  totalSize += stats.size;
});

cssFiles.forEach((file) => {
  const stats = fs.statSync(path.join(distPath, file));
  fileStats.push({ name: file, size: stats.size, type: 'css' });
  totalSize += stats.size;
});

fileStats.sort((a, b) => b.size - a.size);

fileStats.forEach((f) => {
  const sizeKB = (f.size / 1024).toFixed(2);
  const sizeMB = (f.size / 1024 / 1024).toFixed(2);
  const percent = ((f.size / totalSize) * 100).toFixed(1);
  const sizeDisplay = f.size > 100000 ? `${sizeMB} MB` : `${sizeKB} KB`;
  console.log(
    `  ${f.name.padEnd(45)} ${sizeDisplay.padStart(10)} (${percent}%)`
  );
});

console.log('');
console.log('=== TOTALS ===');
console.log(`Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(
  `Main Bundle: ${(fileStats[0].size / 1024 / 1024).toFixed(2)} MB (${(
    (fileStats[0].size / totalSize) *
    100
  ).toFixed(1)}%)`
);
console.log(`Number of JS files: ${jsFiles.length}`);
console.log(`Number of CSS files: ${cssFiles.length}`);

console.log('');
console.log('=== ESTIMATED GZIPPED SIZES ===');
console.log(
  `Total (gzipped ~35%): ${((totalSize * 0.35) / 1024 / 1024).toFixed(2)} MB`
);
console.log(
  `Main bundle (gzipped ~35%): ${(
    (fileStats[0].size * 0.35) /
    1024 /
    1024
  ).toFixed(2)} MB`
);

console.log('');
console.log('=== ANALYSIS ===');

if (fileStats[0].size > 1000000) {
  console.log('⚠️  Main bundle is > 1MB - HIGH PRIORITY for optimization');
}

const lazyChunks = fileStats.filter(
  (f) =>
    f.type === 'js' &&
    !['main', 'runtime', 'styles'].some((n) => f.name.includes(n))
);
console.log(`✓  Lazy chunks found: ${lazyChunks.length}`);

if (lazyChunks.length < 5) {
  console.log('⚠️  Consider implementing more code splitting');
}

console.log('');

const analysisDir = './dist/analysis/bundle';
const summaryFile = path.join(
  analysisDir,
  `summary-${timestamp.replace(/[:.]/g, '-').slice(0, -5)}.json`
);
const summary = {
  timestamp,
  totalSize: totalSize,
  totalSizeMB: parseFloat((totalSize / 1024 / 1024).toFixed(2)),
  mainBundleSize: fileStats[0].size,
  mainBundleSizeMB: parseFloat((fileStats[0].size / 1024 / 1024).toFixed(2)),
  mainBundlePercent: parseFloat(
    ((fileStats[0].size / totalSize) * 100).toFixed(1)
  ),
  gzippedEstimateMB: parseFloat(((totalSize * 0.35) / 1024 / 1024).toFixed(2)),
  numberOfJsFiles: jsFiles.length,
  numberOfCssFiles: cssFiles.length,
  lazyChunksCount: lazyChunks.length,
  assets: fileStats.map((f) => ({
    name: f.name,
    size: f.size,
    sizeMB: parseFloat((f.size / 1024 / 1024).toFixed(2)),
    type: f.type,
  })),
};

try {
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`✓ Summary saved to: ${summaryFile}`);
} catch (err) {
  console.warn('Could not save summary file:', err.message);
}
