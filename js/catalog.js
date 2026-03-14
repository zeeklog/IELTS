/**
 * IELTS 资料目录 - 从 path.json 解析并分类到四科
 */

const EXCLUDED_EXTENSIONS = ['qkdownloading', 'gitignore', 'yml', 'json'];
const EXCLUDED_PATHS = ['path.json', 'package.json', '.github/', 'index-snap2html.html'];

const CATEGORY_RULES = {
  listening: (p) =>
    p.startsWith('雅思真题音频/') || p.startsWith('雅思听力资料/'),
  reading: (p) =>
    /^剑桥.*\.pdf$/.test(p) && !p.includes('体验版'),
  writing: (p) =>
    p.startsWith('雅思作文资料/') || p.startsWith('雅思作文案例/'),
  speaking: (p) =>
    /^剑桥.*\.pdf$/.test(p) && !p.includes('体验版'),
};

function getExtension(path) {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) return '';
  return path.slice(lastDot + 1).toLowerCase();
}

function shouldExclude(path) {
  const ext = getExtension(path);
  if (EXCLUDED_EXTENSIONS.includes(ext)) return true;
  return EXCLUDED_PATHS.some((ex) => path.includes(ex));
}

function getCategory(path) {
  for (const [cat, rule] of Object.entries(CATEGORY_RULES)) {
    if (rule(path)) return cat;
  }
  return null;
}

/**
 * 从 path.json 的 paths 解析并分类
 * @param {Object} pathData - path.json 内容
 * @returns {Object} { listening, reading, writing, speaking }
 */
function buildCatalog(pathData) {
  const catalog = {
    listening: { audio: [], materials: [] },
    reading: [],
    writing: { materials: [], samples: [], images: [] },
    speaking: [],
  };

  const paths = pathData.paths || [];
  for (const p of paths) {
    if (shouldExclude(p)) continue;

    const cat = getCategory(p);
    if (!cat) continue;

    const ext = getExtension(p);

    if (cat === 'listening') {
      if (p.startsWith('雅思听力资料/')) {
        catalog.listening.materials.push(p);
      } else {
        catalog.listening.audio.push(p);
      }
    } else if (cat === 'reading' || cat === 'speaking') {
      catalog[cat].push(p);
    } else if (cat === 'writing') {
      if (p.startsWith('雅思作文案例/')) {
        if (ext === 'md') catalog.writing.samples.push(p);
        else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext))
          catalog.writing.images.push(p);
      } else {
        catalog.writing.materials.push(p);
      }
    }
  }

  // 听力音频按剑雅版本分组
  catalog.listening.audioByBook = groupListeningByBook(catalog.listening.audio);

  return catalog;
}

/**
 * 按剑雅版本分组（从路径提取 雅思真题音频/目录名/ 作为分组键）
 */
function groupListeningByBook(audioPaths) {
  const groups = {};
  const dirRegex = /雅思真题音频\/([^/]+)\//;
  for (const p of audioPaths) {
    const m = p.match(dirRegex);
    const key = m ? m[1] : 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return Object.keys(groups)
    .sort()
    .reduce((acc, k) => {
      acc[k] = groups[k];
      return acc;
    }, {});
}

/**
 * 加载 path.json 并返回分类后的目录
 * 优先使用内嵌的 PATH_JSON（支持 file:// 本地打开），否则通过 fetch 加载
 */
async function loadCatalog(basePath) {
  if (typeof window !== 'undefined' && window.PATH_JSON) {
    return buildCatalog(window.PATH_JSON);
  }
  basePath = basePath || '';
  const url = basePath ? basePath + 'path.json' : 'path.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load path.json: ' + res.status);
  const data = await res.json();
  return buildCatalog(data);
}

function isPathInCatalog(catalog, filePath) {
  if (!catalog || !filePath) return false;
  const check = (arr) => Array.isArray(arr) && arr.includes(filePath);
  if (check(catalog.listening?.audio)) return true;
  if (check(catalog.listening?.materials)) return true;
  if (check(catalog.reading)) return true;
  if (check(catalog.speaking)) return true;
  if (check(catalog.writing?.materials)) return true;
  if (check(catalog.writing?.samples)) return true;
  for (const paths of Object.values(catalog.listening?.audioByBook || {})) {
    if (Array.isArray(paths) && paths.includes(filePath)) return true;
  }
  return false;
}

window.loadCatalog = loadCatalog;
window.isPathInCatalog = isPathInCatalog;
