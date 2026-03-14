/**
 * 推荐学习平台 - 按 Readme 学习建议分门别类
 */
(function () {
  const LEARNING_LINKS = {
    '雅思简介': [
      { name: '什么是雅思', url: 'http://takeielts.britishcouncil.org/choose-ielts/what-ielts', desc: '新手指南' },
    ],
    '本项目': [
      { name: '预览网站', url: 'https://zeeklog.github.io/IETLS/', desc: '在线预览 PDF、音频、Markdown' },
      { name: '原文件浏览', url: 'https://zeeklog.github.io/IETLS/index-snap2html.html', desc: '文件树浏览' },
      { name: '写作范文', url: 'https://github.com/zeeklog/IETLS/tree/master/雅思作文案例', desc: 'GitHub 范文目录' },
      { name: '作者博客', url: 'https://zeeklog.com', desc: '更多内容' },
    ],
    '听力': [
      { name: '高级听力', url: 'http://www.highlevellistening.com/' },
      { name: '雅思官方网站', url: 'https://www.ielts.org/about-the-test/sample-test-questions' },
      { name: '考试英语', url: 'http://examenglish.com/IELTS/IELTS_listening.html' },
      { name: 'BBC 节目', url: 'http://www.bbc.co.uk/programmes/b006qykl' },
      { name: '口音学习', url: 'http://accent.gmu.edu/', desc: '乔治梅森大学' },
      { name: 'BBC 播客', url: 'http://learnenglish.britishcouncil.org/en/listen-and-watch' },
      { name: '英国文化协会听力', url: 'http://takeielts.britishcouncil.org/prepare-your-test/free-ielts-practice-tests/listening-practice-test-1' },
    ],
    '阅读': [
      { name: '雅思提升阅读', url: 'http://ielts-up.com/reading/ielts-reading-test.html' },
    ],
    '写作': [
      { name: '雅思提升写作', url: 'http://ielts-up.com/exercises/ielts-writing-exercises.html' },
      { name: '雅思 6→9 分', url: 'https://ielts69.com/' },
      { name: '迷你雅思', url: 'http://mini-ielts.com/' },
    ],
    '口语': [
      { name: 'Verbling', url: 'https://www.verbling.com/', desc: '在线英语家教' },
      { name: 'Cambly', url: 'https://www.cambly.com/', desc: '日常口语练习' },
      { name: 'GetspokenApp', url: 'http://www.getspokenapp.com/', desc: '与教练练习' },
      { name: '英国雅思口语网', url: 'http://www.ieltsspeaking.co.uk/', desc: '词汇闪卡' },
      { name: '雅思口语网', url: 'http://www.speakingielts.com/', desc: '在线模拟器' },
    ],
    '词汇': [
      { name: 'Quizlet', url: 'https://quizlet.com', desc: '单词学习' },
      { name: 'Forvo', url: 'http://forvo.com/', desc: '发音词典' },
    ],
    '综合资源': [
      { name: '雅思莉兹', url: 'http://ieltsliz.com/' },
      { name: '雅思西蒙', url: 'http://ielts-simon.com/ielts-help-and-english-pr/' },
      { name: '克里斯蒂娜博客', url: 'http://www.cristinacabal.com/' },
      { name: '雅思优势', url: 'http://ieltsadvantage.com/' },
      { name: '雅思伙伴', url: 'http://www.ieltsbuddy.com/' },
      { name: '雅思资料网', url: 'http://ieltsmaterial.com/' },
      { name: '雅思学习计划', url: 'http://ieltsielts.com/more/study-plans/' },
      { name: '免费测评', url: 'http://www.canadavisa.com/ielts/free-practice-tests.html' },
      { name: '自学资料网', url: 'http://selfstudymaterials.com/' },
      { name: '雅思在线测试', url: 'https://ieltsonlinetests.com/' },
      { name: '雅思考试网', url: 'https://www.ielts-exam.net/' },
      { name: '方言博客', url: 'http://dialectblog.com/', desc: '口音学习' },
      { name: '快速阅读', url: 'https://www.huffingtonpost.com/tim-ferriss/speed-reading_b_5317784.html' },
    ],
    'YouTube': [
      { name: '雅思莉兹', url: 'https://www.youtube.com/user/ieltsliz' },
      { name: '雅思官方', url: 'https://www.youtube.com/user/IELTSOfficial', desc: '备考技巧' },
      { name: 'Engvid', url: 'https://www.engvid.com/' },
    ],
    '播客': [
      { name: '全耳英语', url: 'https://www.allearsenglish.com/' },
      { name: 'elllo', url: 'http://elllo.org/' },
      { name: '浓缩英语', url: 'https://www.espressoenglish.net/' },
    ],
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderDropdown() {
    let html = '<div class="learning-dropdown-panel">';
    for (const [cat, links] of Object.entries(LEARNING_LINKS)) {
      html += '<div class="learning-dropdown-group">';
      html += '<div class="learning-dropdown-cat">' + escapeHtml(cat) + '</div>';
      html += '<ul class="learning-dropdown-list">';
      for (const item of links) {
        const desc = item.desc ? ' <span class="learning-link-desc">' + escapeHtml(item.desc) + '</span>' : '';
        html += '<li><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(item.name) + desc + '</a></li>';
      }
      html += '</ul></div>';
    }
    html += '</div>';
    return html;
  }

  function init() {
    const trigger = document.getElementById('learning-dropdown-trigger');
    const panel = document.getElementById('learning-dropdown-panel');
    if (!trigger || !panel) return;

    panel.innerHTML = renderDropdown();

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = trigger.closest('.learning-dropdown-wrap');
      panel.classList.toggle('visible');
      wrap?.classList.toggle('open', panel.classList.contains('visible'));
      trigger.setAttribute('aria-expanded', panel.classList.contains('visible'));
    });

    document.addEventListener('click', () => {
      panel.classList.remove('visible');
      trigger.closest('.learning-dropdown-wrap')?.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
    panel.addEventListener('click', (e) => e.stopPropagation());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
