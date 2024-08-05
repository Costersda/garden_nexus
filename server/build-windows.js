const { exec } = require('child_process');
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
console.log('Compiling files...');

function compileNext(index) {
  if (index >= tsFiles.length) {
    console.log('\nAll files compiled successfully');
    return;
  }

  const file = tsFiles[index];
  console.log(`\nCompiling file ${index + 1}/${tsFiles.length}: ${file}`);

  const startTime = Date.now();
  exec(`npx tsc ${file} --outDir ./dist`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error compiling file ${file}:`);
      console.error(stderr);
      process.exit(1);
    }
    const endTime = Date.now();
    console.log(`File compiled successfully in ${(endTime - startTime) / 1000} seconds`);
    if (stdout) console.log(stdout);
    compileNext(index + 1);
  });
}

compileNext(0);