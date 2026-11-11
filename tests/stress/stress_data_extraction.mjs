import fs from 'node:fs';
import path from 'node:path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  [PASS] ${message}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('====================================================');
console.log('STRESS TEST SUITE: Extracted Data Integrity & Schema');
console.log('====================================================\n');

const extractedDir = path.resolve('extracted_data');
const uploadsDir = path.join(extractedDir, 'uploads');
const initialPagesPath = path.join(extractedDir, 'initialPages.json');
const serviceModalsPath = path.join(extractedDir, 'serviceModals.json');
const siteConfigPath = path.join(extractedDir, 'siteConfig.json');

// --- 1. JSON Parse Robustness & Encoding ---
console.log('--- 1. Testing JSON Parse Robustness & File Encoding ---');
[initialPagesPath, serviceModalsPath, siteConfigPath].forEach((filePath) => {
  const fileName = path.basename(filePath);
  assert(fs.existsSync(filePath), `File exists: ${fileName}`);
  const stats = fs.statSync(filePath);
  assert(stats.size > 0, `File is non-empty: ${fileName} (${stats.size} bytes)`);

  // Test buffer vs utf8 reading
  const rawBuffer = fs.readFileSync(filePath);
  // Check for UTF-8 BOM if any
  const hasBOM = rawBuffer[0] === 0xEF && rawBuffer[1] === 0xBB && rawBuffer[2] === 0xBF;
  assert(!hasBOM, `File does not have byte-order mark (BOM): ${fileName}`);

  let parsed = null;
  try {
    parsed = JSON.parse(rawBuffer.toString('utf8'));
    assert(parsed !== null && typeof parsed === 'object', `Valid JSON parse: ${fileName}`);
  } catch (err) {
    assert(false, `JSON parse threw error for ${fileName}: ${err.message}`);
  }
});

const initialPages = JSON.parse(fs.readFileSync(initialPagesPath, 'utf8'));
const serviceModals = JSON.parse(fs.readFileSync(serviceModalsPath, 'utf8'));
const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));

// --- 2. Check 4 Pages Schema ---
console.log('\n--- 2. Checking 4 Published Pages Schema & Integrity ---');
assert(Array.isArray(initialPages), 'initialPages is an array');
assert(initialPages.length === 4, `Contains exactly 4 pages (found: ${initialPages.length})`);

const expectedPages = [
  { id: '83', slugPattern: /^\/?$|^a-angers$/, titleContains: 'cordonnerie' },
  { id: '888', slugPattern: /lexique-des-cuirs/, titleContains: 'cuirs' },
  { id: '1022', slugPattern: /lexique-semelles-exterieurs/, titleContains: 'semelles' },
  { id: '1046', slugPattern: /lexique-chaussures/, titleContains: 'chaussures' },
];

for (const exp of expectedPages) {
  const page = initialPages.find((p) => String(p.id) === exp.id);
  assert(page !== undefined, `Page with ID ${exp.id} exists in initialPages`);
  if (page) {
    assert(typeof page.title === 'string' && page.title.trim().length > 0, `Page ${exp.id} has non-empty title: "${page.title}"`);
    assert(page.title.toLowerCase().includes(exp.titleContains.toLowerCase()), `Page ${exp.id} title matches expected topic (${exp.titleContains})`);
    assert(typeof page.slug === 'string' && page.slug.trim().length > 0, `Page ${exp.id} has non-empty slug: "${page.slug}"`);
    assert(exp.slugPattern.test(page.slug), `Page ${exp.id} slug matches pattern: ${page.slug}`);
    assert(page.status === 'published', `Page ${exp.id} status is 'published' (actual: '${page.status}')`);
    
    // Check PuckData structure
    assert(page.publishedData && typeof page.publishedData === 'object', `Page ${exp.id} has publishedData object`);
    assert(Array.isArray(page.publishedData.content), `Page ${exp.id} publishedData.content is array`);
    assert(page.publishedData.content.length > 0, `Page ${exp.id} publishedData.content is non-empty (${page.publishedData.content.length} blocks)`);
    assert(page.draftData && typeof page.draftData === 'object', `Page ${exp.id} has draftData object`);
    assert(Array.isArray(page.draftData.content), `Page ${exp.id} draftData.content is array`);
    assert(page.draftData.content.length > 0, `Page ${exp.id} draftData.content is non-empty (${page.draftData.content.length} blocks)`);
    
    // Check root props
    assert(page.publishedData.root && typeof page.publishedData.root === 'object', `Page ${exp.id} publishedData has root`);
    assert(page.publishedData.root.props && typeof page.publishedData.root.props.title === 'string', `Page ${exp.id} root has valid props.title`);
  }
}

// --- 3. Check All 12 Services & Modals Schema ---
console.log('\n--- 3. Checking All 12 Services, Modals & Price Grids ---');
assert(serviceModals && typeof serviceModals === 'object', 'serviceModals is an object');
const servicesList = serviceModals.services || (Array.isArray(serviceModals) ? serviceModals : []);
assert(servicesList.length === 12, `Total services count is exactly 12 (found: ${servicesList.length})`);

servicesList.forEach((svc, idx) => {
  const svcNum = idx + 1;
  assert(svc.id !== undefined && svc.id !== null, `Service #${svcNum} has valid ID: ${svc.id}`);
  assert(typeof svc.title === 'string' && svc.title.trim().length > 0, `Service #${svcNum} has non-empty title: "${svc.title}"`);
  
  // Check description: could be shortDescription or modalDescription content
  const hasDesc = (typeof svc.shortDescription === 'string' && svc.shortDescription.trim().length > 0) ||
                  (svc.modalDescription && typeof svc.modalDescription.content === 'string' && svc.modalDescription.content.trim().length > 0);
  assert(hasDesc, `Service #${svcNum} ("${svc.title}") has valid non-empty description`);

  // Check modal description object
  if (svc.modalDescription) {
    const hasTemplate = svc.modalDescription.templateId !== undefined && svc.modalDescription.templateId !== null;
    assert(hasTemplate, `Service #${svcNum} modalDescription has templateId (${svc.modalDescription.templateId})`);
    assert(typeof svc.modalDescription.title === 'string' && svc.modalDescription.title.trim().length > 0, `Service #${svcNum} modalDescription has title: "${svc.modalDescription.title}"`);
    assert(typeof svc.modalDescription.content === 'string' && svc.modalDescription.content.trim().length > 0, `Service #${svcNum} modalDescription has content html`);
  } else {
    assert(false, `Service #${svcNum} is missing modalDescription`);
  }

  // Check price grid (modalTarifs)
  if (svc.modalTarifs) {
    const hasTemplate = (svc.modalTarifs.templateIdDesktop !== undefined) || (svc.modalTarifs.templateId !== undefined);
    assert(hasTemplate, `Service #${svcNum} modalTarifs has templateId reference (desktop: ${svc.modalTarifs.templateIdDesktop})`);
    const hasPriceImages = (Array.isArray(svc.modalTarifs.priceGridImages) && svc.modalTarifs.priceGridImages.length > 0) ||
                           (Array.isArray(svc.modalTarifs.priceGridImagesMobile) && svc.modalTarifs.priceGridImagesMobile.length > 0);
    assert(hasPriceImages, `Service #${svcNum} modalTarifs has non-empty price grid images`);
  } else {
    assert(false, `Service #${svcNum} is missing modalTarifs`);
  }
});

// --- 4. Verify 100% of all image paths referenced in JSON exist on disk ---
console.log('\n--- 4. Verifying 100% of Image Paths Referenced in JSON ---');

const referencedImages = new Set();

function extractImagePaths(obj) {
  if (!obj) return;
  if (typeof obj === 'string') {
    // Check if string contains uploads path or image extension
    const matches = obj.match(/(?:\/uploads\/|uploads\/)[^\s"'<>)]+\.(?:jpg|jpeg|png|webp|svg|gif)/gi);
    if (matches) {
      for (const m of matches) {
        referencedImages.add(m.trim());
      }
    } else if (/\.(?:jpg|jpeg|png|webp|svg|gif)(?:$|[?#])/i.test(obj)) {
      if (obj.includes('/uploads/')) {
        const clean = obj.replace(/^.*?\/uploads\//i, '/uploads/');
        referencedImages.add(clean.split(/[?#]/)[0]);
      }
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) extractImagePaths(item);
    return;
  }
  if (typeof obj === 'object') {
    for (const val of Object.values(obj)) extractImagePaths(val);
  }
}

extractImagePaths(initialPages);
extractImagePaths(serviceModals);
extractImagePaths(siteConfig);

console.log(`Discovered ${referencedImages.size} unique image references across initialPages, serviceModals, siteConfig:`);

let missingImages = [];
for (const relPath of referencedImages) {
  // Normalize: remove leading /uploads/ or uploads/
  let normalized = relPath.replace(/^[\/\\]?uploads[\/\\]?/i, '');
  // normalize slashes for windows filesystem
  normalized = normalized.replace(/\//g, path.sep);
  const fullDiskPath = path.join(uploadsDir, normalized);
  if (!fs.existsSync(fullDiskPath)) {
    missingImages.push({ relPath, fullDiskPath });
  }
}

if (missingImages.length === 0) {
  assert(true, `100% of image paths exist on disk! (${referencedImages.size}/${referencedImages.size} found)`);
} else {
  assert(false, `${missingImages.length} images are missing on disk:`);
  missingImages.forEach((m) => console.error(`    MISSING: ${m.relPath} -> ${m.fullDiskPath}`));
}

// Check total files in uploads directory
function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      count += countFiles(path.join(dir, ent.name));
    } else {
      count++;
    }
  }
  return count;
}

const totalUploadsOnDisk = countFiles(uploadsDir);
assert(totalUploadsOnDisk === 112, `Total image files on disk in extracted_data/uploads is 112 (found: ${totalUploadsOnDisk})`);

console.log('\n====================================================');
console.log(`SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
