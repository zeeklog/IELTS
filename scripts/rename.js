#!/usr/bin/env node
/**
 * 统一整理项目文件名
 * 执行后需运行 npm run build 更新 path-data.js 和 md-content.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 重命名映射：旧路径 -> 新路径（相对于项目根目录）
const RENAMES = [
  // 根目录 - 剑桥真题 PDF 统一命名
  ['剑桥11.pdf', '剑桥雅思真题11.pdf'],
  ['剑桥雅思真题 13.pdf', '剑桥雅思真题13.pdf'],
  ['剑桥雅思官方真题集15.pdf', '剑桥雅思真题15.pdf'],
  ['剑桥雅思官方真题集16 （学术类）.pdf', '剑桥雅思真题16.pdf'],
  ['剑桥雅思真题14（A类）.pdf', '剑桥雅思真题14.pdf'],

  // 雅思作文资料 - 简化
  ['雅思作文资料/《剑桥图表题大全》.pdf', '雅思作文资料/剑桥图表题大全.pdf'],
  ['雅思作文资料/《小伴侣词汇之写作》.pdf', '雅思作文资料/小伴侣词汇之写作.pdf'],
  ['雅思作文资料/剑桥雅思-写作高分范文.pdf', '雅思作文资料/剑桥雅思写作高分范文.pdf'],
  ['雅思作文资料/就是要你过雅思写作6.5.pdf', '雅思作文资料/过雅思写作6.5.pdf'],
  ['雅思作文资料/7周轻松突破雅思写作拿7分（杨凡）.pdf', '雅思作文资料/7周突破雅思写作7分-杨凡.pdf'],
  ['雅思作文资料/雅思8分万能作文.pdf', '雅思作文资料/雅思8分万能作文.pdf'], // 不变
  ['雅思作文资料/雅思写作7 范文.pdf', '雅思作文资料/雅思写作7范文.pdf'],
  ['雅思作文资料/雅思写作7分288单词.pdf', '雅思作文资料/雅思写作7分288词.pdf'],
  ['雅思作文资料/雅思写作真经.pdf', '雅思作文资料/雅思写作真经.pdf'], // 不变
  ['雅思作文资料/雅思写作词汇.pdf', '雅思作文资料/雅思写作词汇.pdf'], // 不变
  ['雅思作文资料/2022年1-4月雅思大作文真题及范文汇总.pdf', '雅思作文资料/2022年1-4月大作文真题范文.pdf'],
  ['雅思作文资料/Ideas for IELTS topics.pdf', '雅思作文资料/Ideas-for-IELTS-Topics.pdf'],
  ['雅思作文资料/黑眼睛雅思系列：IELTS考试技能训练教程写作(修订版).pdf', '雅思作文资料/黑眼睛雅思写作教程.pdf'],

  // 雅思听力资料
  ['雅思听力资料/4周攻克雅思听力周计划.pdf', '雅思听力资料/4周攻克雅思听力.pdf'],
  ['雅思听力资料/剑桥雅思听力考点词真经.pdf', '雅思听力资料/剑桥雅思听力考点词.pdf'],
  ['雅思听力资料/雅思听力词汇小伴侣.pdf', '雅思听力资料/雅思听力词汇小伴侣.pdf'], // 不变
  ['雅思听力资料/雅思词汇精讲听力篇.pdf', '雅思听力资料/雅思词汇精讲-听力.pdf'],

  // 雅思作文案例 - MD 和图片
  ['雅思作文案例/IELTS Report Samples | Line Graphs.md', '雅思作文案例/折线图范文.md'],
  ['雅思作文案例/Participation in Various Activities at Social Centre | IELTS Cambridge 19.md', '雅思作文案例/社交中心活动参与-剑桥19.md'],
  ['雅思作文案例/Porth Harbour Today and in Year 2000.md', '雅思作文案例/港口变化对比-剑桥19.md'],
  ['雅思作文案例/images/img.png', '雅思作文案例/images/港口对比图.png'],
  ['雅思作文案例/images/img_1.png', '雅思作文案例/images/英国快餐消费图.png'],
  ['雅思作文案例/images/img_2.png', '雅思作文案例/images/加拿大毕业生图.png'],
  ['雅思作文案例/images/2.png', '雅思作文案例/images/社交中心活动图.png'],
];

// 雅思真题音频 - 目录名统一（中文括号改为短横线）
const AUDIO_DIR_RENAMES = [
  ['雅思真题音频/【04】剑桥雅思4听力音频', '雅思真题音频/04-剑桥雅思4'],
  ['雅思真题音频/【05】剑桥雅思5听力音频', '雅思真题音频/05-剑桥雅思5'],
  ['雅思真题音频/【06】剑桥雅思6听力音频', '雅思真题音频/06-剑桥雅思6'],
  ['雅思真题音频/【07】剑桥雅思7听力音频', '雅思真题音频/07-剑桥雅思7'],
  ['雅思真题音频/【08】剑桥雅思8听力音频', '雅思真题音频/08-剑桥雅思8'],
  ['雅思真题音频/【09】剑桥雅思9听力音频', '雅思真题音频/09-剑桥雅思9'],
  ['雅思真题音频/【10】剑桥雅思10听力音频', '雅思真题音频/10-剑桥雅思10'],
  ['雅思真题音频/【11】剑桥雅思11听力音频', '雅思真题音频/11-剑桥雅思11'],
  ['雅思真题音频/【12】剑桥雅思12听力音频', '雅思真题音频/12-剑桥雅思12'],
  ['雅思真题音频/【13】剑桥雅思13听力音频', '雅思真题音频/13-剑桥雅思13'],
  ['雅思真题音频/【14】剑桥雅思14听力音频', '雅思真题音频/14-剑桥雅思14'],
  ['雅思真题音频/【15】Cambridge 15 audio', '雅思真题音频/15-剑桥雅思15'],
  ['雅思真题音频/【16】Cambridge 16-音频', '雅思真题音频/16-剑桥雅思16'],
  ['雅思真题音频/【17】剑桥雅思17听力音频', '雅思真题音频/17-剑桥雅思17'],
  ['雅思真题音频/【18】剑桥雅思18听力音频', '雅思真题音频/18-剑桥雅思18'],
];

function moveFile(oldPath, newPath) {
  const oldFull = path.join(ROOT, oldPath);
  const newFull = path.join(ROOT, newPath);
  if (!fs.existsSync(oldFull)) {
    console.warn('  ⚠ 跳过（不存在）:', oldPath);
    return false;
  }
  const dir = path.dirname(newFull);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.renameSync(oldFull, newFull);
  return true;
}

function updateMdImageRefs(mdPath, oldImg, newImg) {
  const full = path.join(ROOT, mdPath);
  if (!fs.existsSync(full)) return;
  let content = fs.readFileSync(full, 'utf8');
  content = content.replace(oldImg, newImg);
  fs.writeFileSync(full, content, 'utf8');
}

function main() {
  console.log('开始整理文件名...\n');

  // 1. 重命名根目录和资料文件
  for (const [oldP, newP] of RENAMES) {
    if (oldP === newP) continue;
    if (moveFile(oldP, newP)) {
      console.log('  ✓', oldP, '->', newP);
    }
  }

  // 2. 重命名音频目录（目录重命名后，其下所有文件会一起移动）
  for (const [oldDir, newDir] of AUDIO_DIR_RENAMES) {
    if (moveFile(oldDir, newDir)) {
      console.log('  ✓ 目录', oldDir, '->', newDir);
    }
  }

  // 3. 更新 MD 中的图片引用
  const imgUpdates = [
    ['雅思作文案例/折线图范文.md', 'images/img_1.png', 'images/英国快餐消费图.png'],
    ['雅思作文案例/折线图范文.md', 'images/img_2.png', 'images/加拿大毕业生图.png'],
    ['雅思作文案例/港口变化对比-剑桥19.md', 'images/img.png', 'images/港口对比图.png'],
    ['雅思作文案例/社交中心活动参与-剑桥19.md', 'images/2.png', 'images/社交中心活动图.png'],
  ];
  for (const [md, oldRef, newRef] of imgUpdates) {
    updateMdImageRefs(md, oldRef, newRef);
    console.log('  ✓ 更新引用:', md);
  }

  console.log('\n完成。请运行 npm run build 更新 path.json 和编译资源。');
}

main();
