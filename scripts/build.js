#!/usr/bin/env node
/**
 * 编译期构建脚本：一次性生成 path-data.js、md-content.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function build() {
  console.log('Building...\n');

  // 1. 读取 path.json
  const pathJsonPath = path.join(ROOT, 'path.json');
  if (!fs.existsSync(pathJsonPath)) {
    console.error('Error: path.json not found');
    process.exit(1);
  }
  const pathData = JSON.parse(fs.readFileSync(pathJsonPath, 'utf8'));

  // 2. 生成 path-data.js
  const pathDataJs = 'window.PATH_JSON = ' + JSON.stringify(pathData) + ';';
  fs.writeFileSync(path.join(ROOT, 'js', 'path-data.js'), pathDataJs, 'utf8');
  console.log('  ✓ js/path-data.js');

  // 3. 生成 md-content.js
  const mdPaths = (pathData.paths || []).filter((p) => p.endsWith('.md'));
  const mdContent = {};
  for (const p of mdPaths) {
    try {
      mdContent[p] = fs.readFileSync(path.join(ROOT, p), 'utf8');
    } catch (e) {
      console.warn('  ⚠ Skip:', p, e.message);
    }
  }
  const mdContentJs = 'window.MD_CONTENT = ' + JSON.stringify(mdContent) + ';';
  fs.writeFileSync(path.join(ROOT, 'js', 'md-content.js'), mdContentJs, 'utf8');
  console.log('  ✓ js/md-content.js (' + Object.keys(mdContent).length + ' files)');

  console.log('\nDone.');
}

build();
