/**
 * IELTS 资料预览应用 - 主逻辑
 */

(function () {
  const BASE_PATH = (function () {
    if (window.location.protocol === 'file:') return './';
    const p = window.location.pathname;
    if (p.includes('/IETLS')) return '/IETLS/';
    if (p.includes('/ielts')) return '/ielts/';
    return './';
  })();

  let catalog = null;

  const SECTIONS = ['listening', 'reading', 'writing', 'speaking'];
  const SECTION_LABELS = {
    listening: '听力',
    reading: '阅读',
    writing: '写作',
    speaking: '口语',
  };

  function $(sel, parent = document) {
    return parent.querySelector(sel);
  }

  function $$(sel, parent = document) {
    return Array.from(parent.querySelectorAll(sel));
  }

  function parseHash() {
    const hash = window.location.hash.slice(1) || '/listening';
    const [pathPart, queryPart] = hash.split('?');
    const section = (pathPart || '').replace(/^\/?|\/$/g, '') || 'listening';
    let file = null;
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const f = params.get('file');
      if (f) file = decodeURIComponent(f);
    }
    return {
      section: SECTIONS.includes(section) ? section : 'listening',
      file: file,
    };
  }

  function getHashSection() {
    return parseHash().section;
  }

  function updateHash(section, file) {
    let hash = '/' + (section || getHashSection());
    if (file) hash += '?file=' + encodeURIComponent(file);
    const newHash = '#' + hash;
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  function renderNav() {
    const navItems = $('#nav-items');
    if (!navItems) return;
    navItems.innerHTML = SECTIONS.map(
      (s) =>
        `<a href="#/${s}" class="nav-item" data-section="${s}">${SECTION_LABELS[s]}</a>`
    ).join('');
  }

  function getTipsHtml(section) {
    if (!IELTS_TIPS || !IELTS_TIPS[section]) return '';
    const t = IELTS_TIPS[section];
    return (
      '<div class="tips-tooltip-inner">' +
      '<h4>' + t.title + '：' + t.core + '</h4>' +
      '<p class="tips-logic">' + t.logic + '</p>' +
      (t.training?.length ? '<ul><li>' + t.training.join('</li><li>') + '</li></ul>' : '') +
      (t.skills?.length ? '<p><strong>技巧：</strong>' + t.skills.join('；') + '</p>' : '') +
      (t.pitfalls?.length ? '<p class="pitfalls"><strong>避坑：</strong>' + t.pitfalls.join('、') + '</p>' : '') +
      '</div>'
    );
  }

  function updateTooltipContent() {
    const tooltip = $('#tips-tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = getTipsHtml(getHashSection());
  }

  function renderFileList(section) {
    const list = $('#file-list');
    if (!list || !catalog) return;

    let items = [];
    if (section === 'listening') {
      const books = catalog.listening?.audioByBook || {};
      for (const [book, paths] of Object.entries(books)) {
        items.push({ type: 'group', label: book, paths });
      }
      items = items.concat(
        (catalog.listening?.materials || []).map((p) => ({ type: 'file', path: p }))
      );
    } else if (section === 'reading' || section === 'speaking') {
      items = (catalog[section] || []).map((p) => ({ type: 'file', path: p }));
    } else if (section === 'writing') {
      items = [
        ...(catalog.writing?.materials || []).map((p) => ({ type: 'file', path: p })),
        ...(catalog.writing?.samples || []).map((p) => ({ type: 'file', path: p })),
      ];
    }

    if (items.length === 0) {
      list.innerHTML = '<p class="empty">暂无资料</p>';
      return;
    }

    list.innerHTML = items
      .map((item) => {
        if (item.type === 'group') {
          const files = item.paths
            .map(
              (p) =>
                `<li><a href="#" data-path="${escapeAttr(p)}">${getFileName(p)}</a></li>`
            )
            .join('');
          return `<div class="file-group"><h4>${item.label}</h4><ul>${files}</ul></div>`;
        }
        return `<div class="file-item"><a href="#" data-path="${escapeAttr(item.path)}">${getFileName(item.path)}</a></div>`;
      })
      .join('');
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getFileName(path) {
    return path.split('/').pop() || path;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showSection(section, keepFile) {
    $$('.nav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.section === section);
    });
    updateTooltipContent();
    renderFileList(section);
    if (!keepFile) {
      const preview = $('#preview');
      if (preview) preview.innerHTML = '<p class="preview-placeholder">选择左侧文件进行预览</p>';
    }
  }

  function showPreview(path, updateUrl) {
    const container = $('#preview');
    if (!container) return;
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'preview-wrap';
    const isPdf = /\.pdf$/i.test(path);
    const warningHtml = isPdf
      ? '<span class="preview-pdf-warning">文档中的二维码可信度未知，请自行甄别，谨防上当受骗。</span>'
      : '';
    wrap.innerHTML =
      '<div class="preview-header">' +
      '<span class="preview-title">' + escapeHtml(getFileName(path)) + '</span>' +
      warningHtml +
      '</div><div class="preview-content"></div>';
    container.appendChild(wrap);
    const content = wrap.querySelector('.preview-content');
    renderPreview(path, content, BASE_PATH);
    if (updateUrl !== false) {
      const section = getHashSection();
      updateHash(section, path);
    }
  }

  function applyState(parsed) {
    const section = parsed.section;
    const file = parsed.file;
    showSection(section, !!file);
    if (file && isPathInCatalog && isPathInCatalog(catalog, file)) {
      showPreview(file, false);
    }
  }

  function init() {
    renderNav();
    loadCatalog(BASE_PATH)
      .then((c) => {
        catalog = c;
        const parsed = parseHash();
        applyState(parsed);
      })
      .catch((err) => {
        $('#file-list').innerHTML = '<p class="error">加载失败: ' + err.message + '</p>';
      });

    document.addEventListener('click', (e) => {
      const path = e.target.closest('[data-path]')?.dataset?.path;
      if (path) {
        e.preventDefault();
        showPreview(path);
      }
    });

    const tipsWrap = document.querySelector('.tips-trigger-wrap');
    const tipsTooltip = $('#tips-tooltip');
    if (tipsWrap && tipsTooltip) {
      tipsWrap.addEventListener('mouseenter', () => tipsTooltip.classList.add('visible'));
      tipsWrap.addEventListener('mouseleave', () => tipsTooltip.classList.remove('visible'));
    }

    window.addEventListener('hashchange', () => {
      const parsed = parseHash();
      applyState(parsed);
    });

    window.addEventListener('popstate', () => {
      const parsed = parseHash();
      applyState(parsed);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
