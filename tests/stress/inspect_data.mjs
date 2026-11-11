import fs from 'node:fs';
import path from 'node:path';

const extractedDir = path.resolve('extracted_data');
const uploadsDir = path.join(extractedDir, 'uploads');

console.log('--- Inspecting extracted_data directory ---');
console.log('Extracted dir:', extractedDir);

const files = fs.readdirSync(extractedDir);
console.log('Files in extracted_data:', files);

// Let's count files in uploadsDir
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const uploadFiles = getAllFiles(uploadsDir);
console.log('Total files in uploads directory:', uploadFiles.length);
