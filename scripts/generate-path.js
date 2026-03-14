#!/usr/bin/env node
/**
 * 从文件系统扫描生成 path.json
 * 排除：node_modules, .git, path-data.js, md-content.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = ['node_modules', '.git'];
const EXCLUDE_FILES = ['path-data.js', 'md-content.js'];

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    if (EXCLUDE_DIRS.includes(e)) continue;
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (stat.isFile()) {
      if (!EXCLUDE_FILES.includes(e)) list.push(rel);
    } else {
      walk(full, list);
    }
  }
  return list;
}

function main() {
  const paths = walk(ROOT, []);

  const unique = [...new Set(paths)].sort();
  const byExtension = {};
  for (const p of unique) {
    const ext = path.extname(p).slice(1).toLowerCase() || 'noext';
    if (!byExtension[ext]) byExtension[ext] = [];
    byExtension[ext].push(p);
  }

  const out = {
    root: '.',
    totalCount: unique.length,
    paths: unique,
    byExtension,
  };
  fs.writeFileSync(path.join(ROOT, 'path.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log('  ✓ path.json 已生成 (' + unique.length + ' 个路径)');
}

main();
