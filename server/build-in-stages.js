const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = './src';
const tsFiles = [];

function getTsFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getTsFiles(filePath);
    } else if (file.endsWith('.ts')) {
      tsFiles.push(filePath);
    }
  }
}

getTsFiles(srcDir);

const chunkSize = 5; // Reduced chunk size for more granular progress
const totalChunks = Math.ceil(tsFiles.length / chunkSize);

console.log(`Total TypeScript files found: ${tsFiles.length}`);
console.log(`Compiling in ${totalChunks} chunks`);

for (let i = 0; i < tsFiles.length; i += chunkSize) {
  const chunk = tsFiles.slice(i, i + chunkSize);
  const chunkNumber = Math.floor(i / chunkSize) + 1;
  console.log(`\nCompiling chunk ${chunkNumber}/${totalChunks}`);
  console.log(`Files in this chunk: ${chunk.length}`);
  chunk.forEach(file => console.log(`  - ${file}`));
  
  const startTime = Date.now();
  try {
    execSync(`node --max-old-space-size=1536 ./node_modules/.bin/tsc ${chunk.join(' ')} --noEmit`, { stdio: 'inherit' });
    const endTime = Date.now();
    console.log(`Chunk ${chunkNumber} compiled successfully in ${(endTime - startTime) / 1000} seconds`);
  } catch (error) {
    console.error(`Error compiling chunk ${chunkNumber}:`, error);
    process.exit(1);
  }
}

console.log('\nAll chunks compiled successfully');