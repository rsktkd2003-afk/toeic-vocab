/** 選択肢の重複・正解漏れの判定に使う正規化 */

const EN_PUNCT = /[\s.,!?;:'"’‘“”()[\]{}\-–—/]+/g
const JA_PUNCT = /[\s、。・，．（）()「」『』【】〜~～…：:；;！!？?]+/g

export function normalizeEn(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(EN_PUNCT, ' ').trim()
}

export function normalizeJa(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(JA_PUNCT, '')
}

export function normalizeChoice(text: string, lang: 'en' | 'ja'): string {
  return lang === 'en' ? normalizeEn(text) : normalizeJa(text)
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 英文中に語（単語境界つき）が含まれるか。大文字小文字は区別しない */
export function containsEnglishWord(sentence: string, word: string): boolean {
  const w = word.normalize('NFKC').trim()
  if (w === '') return false
  const re = new RegExp(`(^|[^A-Za-z])${escapeRegExp(w)}($|[^A-Za-z])`, 'i')
  return re.test(sentence.normalize('NFKC'))
}

/** 空欄の表記: アンダースコア3文字以上 */
export const BLANK_PATTERN = /_{3,}/g
