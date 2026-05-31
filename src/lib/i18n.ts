import type { Lang } from "@/types";

type Dict = Record<string, { en: string; zh: string }>;

export const T: Dict = {
  appTitle: { en: "HSK Flashcards", zh: "HSK 闪卡" },
  level: { en: "HSK Level", zh: "HSK 等级" },
  lesson: { en: "Lesson", zh: "课程" },
  all: { en: "All", zh: "全部" },
  search: { en: "Search", zh: "搜索" },
  settings: { en: "Settings", zh: "设置" },
  review: { en: "Review", zh: "复习" },
  reviewList: { en: "Review list", zh: "复习表" },
  progress: { en: "Progress", zh: "学习进度" },
  cardView: { en: "Card view", zh: "卡片视图" },
  listView: { en: "List view", zh: "列表视图" },
  random: { en: "Shuffle", zh: "乱序" },
  copy: { en: "Copy hanzi", zh: "复制汉字" },
  copied: { en: "Copied to clipboard", zh: "已复制到剪贴板" },
  pin: { en: "Add to review", zh: "加入复习" },
  unpin: { en: "Remove from review", zh: "移出复习" },
  known: { en: "Mark as known", zh: "标记已掌握" },
  prev: { en: "Previous", zh: "上一张" },
  next: { en: "Next", zh: "下一张" },
  first: { en: "First", zh: "第一张" },
  last: { en: "Last", zh: "最后一张" },
  flip: { en: "Flip", zh: "翻面" },
  playAudio: { en: "Play pronunciation", zh: "播放发音" },
  strokeQuiz: { en: "Stroke quiz", zh: "笔顺测验" },
  strokeQuizOff: { en: "Quiz off", zh: "关闭测验" },
  animate: { en: "Animate strokes", zh: "演示笔顺" },
  showPinyin: { en: "Show pinyin", zh: "显示拼音" },
  hidePinyin: { en: "Hide pinyin", zh: "隐藏拼音" },
  showEnglish: { en: "Show English", zh: "显示英文" },
  hideEnglish: { en: "Hide English", zh: "隐藏英文" },
  interfaceLang: { en: "Interface language", zh: "界面语言" },
  audioOnly: { en: "Audio only (hide strokes)", zh: "仅发音（隐藏笔顺）" },
  showOutline: { en: "Show stroke outline", zh: "显示笔顺轮廓" },
  hintAfter: { en: "Show hint after misses", zh: "错误多少次后提示" },
  theme: { en: "Theme", zh: "主题" },
  dark: { en: "Dark", zh: "深色" },
  light: { en: "Light", zh: "浅色" },
  radicals: { en: "Radicals", zh: "部首" },
  radicalLookup: { en: "Characters with this radical", zh: "包含该部首的字" },
  words: { en: "words", zh: "词" },
  noCards: { en: "No cards for this selection yet.", zh: "该筛选暂无卡片。" },
  noResults: { en: "No results for this search.", zh: "没有匹配的结果。" },
  searchPlaceholder: { en: "e.g. 天, tian1, xia9 or sky", zh: "如 天、tian1、xia9 或 sky" },
  exactMatch: { en: "Exact match", zh: "精确匹配" },
  caseSensitive: { en: "Case sensitive", zh: "区分大小写" },
  learned: { en: "Learned", zh: "已学" },
  toReview: { en: "To review", zh: "待复习" },
  mastered: { en: "Mastered", zh: "已掌握" },
  clearProgress: { en: "Reset progress", zh: "重置进度" },
  noAudioVoice: {
    en: "No Chinese voice available in this browser.",
    zh: "当前浏览器没有可用的中文语音。",
  },
  shortcuts: { en: "Shortcuts: \u2190 \u2192 navigate \u00b7 Space flip \u00b7 Enter audio", zh: "快捷键：\u2190 \u2192 切换 \u00b7 空格翻面 \u00b7 回车发音" },
};

export function t(key: keyof typeof T | string, lang: Lang): string {
  const entry = T[key as string];
  return entry ? entry[lang] : (key as string);
}

/** Display label for a (canonical) part of speech. */
export const POS_LABELS: Record<string, { en: string; zh: string }> = {
  verb: { en: "verb", zh: "动词" },
  noun: { en: "noun", zh: "名词" },
  "noun/verb": { en: "noun/verb", zh: "名词/动词" },
  adjective: { en: "adjective", zh: "形容词" },
  adverb: { en: "adverb", zh: "副词" },
  "measure word": { en: "measure word", zh: "量词" },
  "modal verb": { en: "modal verb", zh: "能愿动词" },
  number: { en: "number", zh: "数词" },
  particle: { en: "particle", zh: "助词" },
  pronoun: { en: "pronoun", zh: "代词" },
  "proper noun": { en: "proper noun", zh: "专有名词" },
  preposition: { en: "preposition", zh: "介词" },
  conjunction: { en: "conjunction", zh: "连词" },
  auxiliary: { en: "auxiliary", zh: "助动词" },
  interjection: { en: "interjection", zh: "叹词" },
  radical: { en: "radical", zh: "部首" },
};

export function posLabel(pos: string, lang: Lang): string {
  const e = POS_LABELS[pos];
  return e ? e[lang] : pos;
}
