/**
 * 四科快速提分核心方法
 */

const IELTS_TIPS = {
  listening: {
    title: '听力',
    core: '抓「定位 + 同义替换」，2 周提 0.5–1 分',
    logic: '答案在信号词前后（but/however/so/now/finally），所听即所得',
    training: [
      '精听：剑雅真题 Section 3/4，逐句听写，对照原文标连读/弱读/吞音',
      '泛听：BBC 6 Minute English / 雅思场景音频，培养语感',
    ],
    skills: [
      '读题划关键词：数字/地点/人名/否定词（not/never），预判答案词性/内容',
      '同义替换积累：如 reduce=cut down、important=crucial，考前形成词库',
    ],
    pitfalls: ['数字陷阱（日期/货币/单位）', '单复数', '大小写'],
  },
  reading: {
    title: '阅读',
    core: '速度 + 定位，3 篇 60 分钟稳拿 7+',
    logic: '不逐字读，先题后文，平行定位',
    training: [
      '每篇严格 20 分钟，先看题干划关键词（人名/数字/专有名词），再扫读定位',
      '平行阅读法：同时处理多题，减少回读',
    ],
    skills: [
      '填空题：预判词性，找同义替换，原文原词优先',
      '判断题（T/F/NG）：严格按原文，NG≠F，警惕绝对词（all/only/never）',
      '匹配题：先看选项，再扫段落主旨句（首尾句）',
      '长难句拆解：抓主句主谓宾，忽略从句修饰',
    ],
    pitfalls: [],
  },
  writing: {
    title: '写作',
    core: '逻辑 + 结构，1 个月稳 6.5+',
    logic: '任务回应 > 逻辑 > 词汇语法，拒绝模板堆砌',
    training: [
      '小作文（Task 1）：掌握 5 类图表（折线/柱状/饼图/表格/流程图），固定结构：概述+细节+对比',
      '大作文（Task 2）：万能结构：开头→论点1→论点2→结尾，逻辑链：观点→解释→举例→结论',
      '精改 > 多写：每周写 3 篇，对照考官范文改语法/逻辑/衔接',
    ],
    skills: [
      '衔接词：however/meanwhile/overall',
      '高频句式：如 The number of… increased sharply from… to…',
    ],
    pitfalls: [],
  },
  speaking: {
    title: '口语',
    core: '流利 + 素材，1 个月冲 6.5+',
    logic: '自然交流 > 完美答案，用素材串题，减少卡顿',
    training: [
      'Part 1：简洁回答 + 1 句拓展',
      'Part 2：素材复用，准备 3–5 个万能故事（旅行/学习/难忘经历），串 50+ 话题',
      'Part 3：观点 + 解释 + 举例 + 对比',
    ],
    skills: [
      'Part 2 结构：开头+背景+经过+感受，控制在 1分50秒–2 分钟',
      '训练方法：录音复盘、影子跟读法、找语伴模拟',
    ],
    pitfalls: [],
  },
};
