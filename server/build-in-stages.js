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

console.log(`Total TypeScript files found: ${tsFiles.length}`);
console.log('Compiling files one by one');

tsFiles.forEach((file, index) => {
  console.log(`\nCompiling file ${index + 1}/${tsFiles.length}: ${file}`);
  
  const startTime = Date.now();
  try {
    execSync(`node --max-old-space-size=1536 ./node_modules/.bin/tsc ${file} --outDir ./dist`, { stdio: 'inherit' });
    const endTime = Date.now();
    console.log(`File compiled successfully in ${(endTime - startTime) / 1000} seconds`);
  } catch (error) {
    console.error(`Error compiling file ${file}:`, error);
    process.exit(1);
  }
});

console.log('\nAll files compiled successfully');