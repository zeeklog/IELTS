/**
 * IELTS 资料预览 - 按文件类型渲染
 */

const PREVIEW_TYPES = {
  pdf: 'pdf',
  mp3: 'audio',
  m4a: 'audio',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  md: 'markdown',
  html: 'html',
};

function getPreviewType(path) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return PREVIEW_TYPES[ext] || 'unknown';
}

/**
 * 获取文件 URL（支持 base path）
 */
function getFileUrl(path, basePath) {
  const base = basePath || '';
  return base + encodeURI(path);
}

/**
 * 渲染预览内容
 * @param {string} path - 文件路径
 * @param {HTMLElement} container - 预览容器
 * @param {string} basePath - base path
 */
function renderPreview(path, container, basePath = '') {
  const type = getPreviewType(path);
  const url = getFileUrl(path, basePath);

  container.innerHTML = '';
  container.className = `preview-container preview-${type}`;

  switch (type) {
    case 'pdf':
      renderPdf(url, container);
      break;
    case 'audio':
      renderAudio(url, container);
      break;
    case 'image':
      renderImage(url, container);
      break;
    case 'markdown':
      renderMarkdown(path, url, container, basePath);
      break;
    case 'html':
      renderHtml(url, container);
      break;
    default:
      renderFallback(url, path, container);
  }
}

/**
 * PDF 预览：使用 PDF.js 渲染为图片（canvas），支持翻页
 * 若 fetch 失败（如 file:// CORS），回退到 iframe
 */
function renderPdf(url, container) {
  container.innerHTML = getPdfLoadingHtml();
  if (typeof pdfjsLib === 'undefined') {
    renderPdfFallback(url, container);
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error(res.statusText);
      return res.arrayBuffer();
    })
    .then(function (data) {
      return pdfjsLib.getDocument(data).promise;
    })
    .then(function (pdf) {
      renderPdfPages(pdf, container);
    })
    .catch(function () {
      renderPdfFallback(url, container);
    });
}

function getPdfLoadingHtml() {
  return (
    '<div class="preview-loading preview-loading-pdf">' +
    '<div class="preview-loading-spinner"></div>' +
    '<p class="preview-loading-text">加载 PDF 中...</p>' +
    '<p class="preview-loading-hint">文件较大时请稍候</p>' +
    '</div>'
  );
}

function renderPdfFallback(url, container) {
  container.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = 'PDF 预览';
  iframe.className = 'preview-pdf-iframe';
  container.appendChild(iframe);
}

function renderPdfPages(pdf, container) {
  const numPages = pdf.numPages;
  const wrap = document.createElement('div');
  wrap.className = 'pdf-viewer';

  const toolbar = document.createElement('div');
  toolbar.className = 'pdf-toolbar';
  toolbar.innerHTML =
    '<button type="button" class="pdf-btn pdf-prev" aria-label="上一页">‹</button>' +
    '<span class="pdf-page-info"><input type="number" class="pdf-page-input" min="1" value="1"> / ' +
    numPages +
    '</span>' +
    '<button type="button" class="pdf-btn pdf-next" aria-label="下一页">›</button>';

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'pdf-canvas-wrap';
  canvasWrap.innerHTML = '<div class="preview-loading preview-loading-pdf-inline"><div class="preview-loading-spinner"></div><span>渲染页面中...</span></div>';

  wrap.appendChild(toolbar);
  wrap.appendChild(canvasWrap);
  container.innerHTML = '';
  container.appendChild(wrap);

  const prevBtn = toolbar.querySelector('.pdf-prev');
  const nextBtn = toolbar.querySelector('.pdf-next');
  const pageInput = toolbar.querySelector('.pdf-page-input');

  let currentPage = 1;
  const scale = Math.min(2, window.devicePixelRatio || 1.5);

  function renderPage(pageNum) {
    currentPage = Math.max(1, Math.min(pageNum, numPages));
    pageInput.value = currentPage;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= numPages;

    canvasWrap.innerHTML = '<div class="preview-loading preview-loading-pdf-inline"><div class="preview-loading-spinner"></div><span>渲染页面中...</span></div>';

    pdf.getPage(currentPage).then(function (page) {
      const viewport = page.getViewport({ scale: scale });
      let canvas = document.createElement('canvas');
      canvasWrap.innerHTML = '';
      canvasWrap.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';

      const renderCtx = {
        canvasContext: ctx,
        viewport: viewport,
      };
      const renderTask = page.render(renderCtx);
      return renderTask.promise;
    }).then(function () {
      // 渲染完成，loading 已在替换 canvas 时移除
    }).catch(function () {
      canvasWrap.innerHTML = '<div class="preview-error">页面渲染失败</div>';
    });
  }

  prevBtn.addEventListener('click', function () {
    renderPage(currentPage - 1);
  });
  nextBtn.addEventListener('click', function () {
    renderPage(currentPage + 1);
  });
  pageInput.addEventListener('change', function () {
    renderPage(parseInt(pageInput.value, 10) || 1);
  });

  renderPage(1);
}

function renderAudio(url, container) {
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = url;
  audio.className = 'preview-audio';
  container.appendChild(audio);
}

function renderImage(url, container) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = '图片预览';
  img.className = 'preview-image';
  container.appendChild(img);
}

function renderHtml(url, container) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = 'HTML 预览';
  iframe.className = 'preview-html';
  container.appendChild(iframe);
}

function renderFallback(url, path, container) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = `下载或在新窗口打开: ${path}`;
  a.className = 'preview-fallback';
  container.appendChild(a);
}

/**
 * Markdown 渲染：优先使用内嵌 MD_CONTENT（支持 file://），否则 fetch
 */
async function renderMarkdown(path, url, container, basePath) {
  container.innerHTML = '<div class="preview-loading">加载中...</div>';
  try {
    let text = null;
    if (typeof window !== 'undefined' && window.MD_CONTENT && window.MD_CONTENT[path]) {
      text = window.MD_CONTENT[path];
    } else {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      text = await res.text();
    }

    // 获取 MD 所在目录，用于重写相对图片路径
    const dir = path.includes('/') ? path.replace(/\/[^/]+$/, '/') : '';

    // 重写图片路径：](images/xxx) -> ](basePath + dir + images/xxx)
    text = text.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, imgPath) => {
        if (imgPath.startsWith('http') || imgPath.startsWith('//')) {
          return match;
        }
        const fullPath = dir + (imgPath.startsWith('/') ? imgPath.slice(1) : imgPath);
        const imgUrl = getFileUrl(fullPath, basePath);
        return '![' + alt + '](' + imgUrl + ')';
      }
    );

    if (typeof marked !== 'undefined') {
      container.innerHTML = marked.parse(text);
      container.classList.add('markdown-body');
    } else {
      container.textContent = text;
    }
  } catch (err) {
    container.innerHTML = '<div class="preview-error">加载失败: ' + err.message + '</div>';
  }
}
