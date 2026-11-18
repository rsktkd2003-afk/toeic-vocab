/**
 * 単語・問題データの自動品質検証（V01〜V13）。
 * 設計: docs/design.md「3-3. 問題の自動品質検証」
 *
 * 自然な英文かどうか・解説の正確さは自動では判定できないため、
 * 人によるレビュー（review.status = approved）を別途必須とする。
 */
import { createHash } from 'node:crypto'
import {
  CEFR_LEVELS,
  PARTS_OF_SPEECH,
  QUESTION_TYPES,
  type ContentManifest,
  type Question,
  type Word,
} from '../../src/content/types.ts'
import {
  BLANK_PATTERN,
  containsEnglishWord,
  normalizeChoice,
  normalizeEn,
  normalizeJa,
} from './normalize.ts'

export type IssueLevel = 'error' | 'warning'

export interface Issue {
  code: string
  level: IssueLevel
  path: string
  message: string
}

export interface ValidateOptions {
  /** production: approved 以外の問題をエラーにする（V09） */
  mode: 'dev' | 'production'
  /** 前回リリースの記録（V10/V11）。初回は null */
  previousManifest: ContentManifest | null
}

type Json = Record<string, unknown>

const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNonEmptyStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isStrArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isNonEmptyStr)

class Collector {
  issues: Issue[] = []
  error(code: string, path: string, message: string) {
    this.issues.push({ code, level: 'error', path, message })
  }
  warn(code: string, path: string, message: string) {
    this.issues.push({ code, level: 'warning', path, message })
  }
}

// ---------- V01: 形式と必須項目 ----------

function checkWordShape(w: unknown, path: string, c: Collector): w is Word {
  const start = c.issues.length
  if (!isObj(w)) {
    c.error('V01', path, '単語がオブジェクトではありません')
    return false
  }
  for (const key of ['wordId', 'headword', 'addedIn'] as const) {
    if (!isNonEmptyStr(w[key])) c.error('V01', `${path}.${key}`, `${key} が空です`)
  }
  if (!isStrArray(w.forms) || w.forms.length === 0)
    c.error('V01', `${path}.forms`, 'forms は1件以上の文字列配列が必要です')
  if (!isStrArray(w.synonyms) && !(Array.isArray(w.synonyms) && w.synonyms.length === 0))
    c.error('V01', `${path}.synonyms`, 'synonyms は文字列配列が必要です')
  if (!isObj(w.pronunciation) || !(w.pronunciation.ipa === null || isNonEmptyStr(w.pronunciation.ipa)))
    c.error('V01', `${path}.pronunciation`, 'pronunciation.ipa は文字列か null が必要です')
  if (!(w.cefr === null || CEFR_LEVELS.includes(w.cefr as never)))
    c.error('V01', `${path}.cefr`, 'cefr は A1〜C2 か null が必要です')
  if (![1, 2, 3, 4, 5].includes(w.band as number))
    c.error('V01', `${path}.band`, 'band は 1〜5 が必要です')
  if (w.status !== 'active' && w.status !== 'deprecated')
    c.error('V01', `${path}.status`, 'status は active / deprecated のいずれかです')
  if (!isObj(w.source) || !isNonEmptyStr(w.source.list) || !isNonEmptyStr(w.source.license))
    c.error('V01', `${path}.source`, 'source.list と source.license が必要です')

  if (!Array.isArray(w.senses) || w.senses.length === 0) {
    c.error('V01', `${path}.senses`, '語義が1件以上必要です')
  } else {
    w.senses.forEach((s, i) => {
      const p = `${path}.senses[${i}]`
      if (!isObj(s)) return c.error('V01', p, '語義がオブジェクトではありません')
      if (!isNonEmptyStr(s.senseId)) c.error('V01', `${p}.senseId`, 'senseId が空です')
      if (!PARTS_OF_SPEECH.includes(s.pos as never)) c.error('V01', `${p}.pos`, `品詞が不正です: ${String(s.pos)}`)
      if (!isStrArray(s.ja) || s.ja.length === 0) c.error('V01', `${p}.ja`, '日本語訳が1件以上必要です')
      if (typeof s.primary !== 'boolean') c.error('V01', `${p}.primary`, 'primary は真偽値が必要です')
    })
  }
  if (!Array.isArray(w.examples) || w.examples.length === 0) {
    c.error('V01', `${path}.examples`, '例文が1件以上必要です')
  } else {
    w.examples.forEach((e, i) => {
      const p = `${path}.examples[${i}]`
      if (!isObj(e)) return c.error('V01', p, '例文がオブジェクトではありません')
      for (const key of ['exId', 'senseId', 'en', 'ja'] as const) {
        if (!isNonEmptyStr(e[key])) c.error('V01', `${p}.${key}`, `${key} が空です`)
      }
    })
  }
  return c.issues.length === start
}

function checkQuestionShape(q: unknown, path: string, c: Collector): q is Question {
  const start = c.issues.length
  if (!isObj(q)) {
    c.error('V01', path, '問題がオブジェクトではありません')
    return false
  }
  for (const key of ['questionId', 'wordId', 'senseId'] as const) {
    if (!isNonEmptyStr(q[key])) c.error('V01', `${path}.${key}`, `${key} が空です`)
  }
  if (!Number.isInteger(q.version) || (q.version as number) < 1)
    c.error('V01', `${path}.version`, 'version は1以上の整数が必要です')
  if (!QUESTION_TYPES.includes(q.type as never)) c.error('V01', `${path}.type`, `問題形式が不正です: ${String(q.type)}`)
  if (!isObj(q.prompt) || !isNonEmptyStr(q.prompt.text)) c.error('V01', `${path}.prompt.text`, '問題文が空です')
  if (q.type === 'cloze' && (!isObj(q.prompt) || !isNonEmptyStr(q.prompt.ja)))
    c.error('V01', `${path}.prompt.ja`, '穴埋め問題には和訳が必要です')
  if (!isObj(q.explanation) || !isNonEmptyStr(q.explanation.ja))
    c.error('V01', `${path}.explanation.ja`, '解説が空です')
  if (!isObj(q.review) || !['draft', 'reviewed', 'approved'].includes(q.review.status as string))
    c.error('V01', `${path}.review.status`, 'review.status は draft / reviewed / approved のいずれかです')

  // V03: 選択肢がちょうど4件、正解番号が0〜3
  if (!Array.isArray(q.choices) || q.choices.length !== 4) {
    c.error('V03', `${path}.choices`, '選択肢はちょうど4件必要です')
  } else {
    q.choices.forEach((ch, i) => {
      const p = `${path}.choices[${i}]`
      if (!isObj(ch) || !isNonEmptyStr(ch.text) || !isNonEmptyStr(ch.fromWordId) || !isNonEmptyStr(ch.fromSenseId))
        c.error('V01', p, '選択肢には text / fromWordId / fromSenseId が必要です')
    })
  }
  if (![0, 1, 2, 3].includes(q.answerIndex as number))
    c.error('V03', `${path}.answerIndex`, '正解番号は0〜3が必要です')
  return c.issues.length === start
}

// ---------- 公開済みデータの不変性（V10）に使うハッシュ ----------

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (isObj(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

/** レビュー情報を除いた問題内容のハッシュ値 */
export function questionHash(q: Question): string {
  const { review: _review, ...content } = q
  return createHash('sha256').update(canonical(content)).digest('hex')
}

/** 公開記録を作る。前回の記録は消さずに引き継ぐ（一度公開したものは不変） */
export function buildManifest(
  dataVersion: string,
  words: Word[],
  questions: Question[],
  previous: ContentManifest | null,
): ContentManifest {
  const questionHashes: Record<string, string> = { ...previous?.questionHashes }
  for (const q of questions) {
    if (q.review.status === 'approved') questionHashes[`${q.questionId}@${q.version}`] = questionHash(q)
  }
  const wordIds = new Set([...(previous?.wordIds ?? []), ...words.map((w) => w.wordId)])
  return { dataVersion, wordIds: [...wordIds].sort(), questionHashes }
}

// ---------- 本体 ----------

export function validateContent(rawWords: unknown[], rawQuestions: unknown[], options: ValidateOptions): Issue[] {
  const c = new Collector()

  const words: Word[] = []
  rawWords.forEach((w, i) => {
    if (checkWordShape(w, `words[${i}]`, c)) words.push(w)
  })
  const questions: { q: Question; path: string }[] = []
  rawQuestions.forEach((q, i) => {
    const path = `questions[${i}]`
    if (checkQuestionShape(q, path, c)) questions.push({ q, path })
  })

  // V02: ID の重複と参照
  const wordById = new Map<string, Word>()
  for (const w of words) {
    if (wordById.has(w.wordId)) c.error('V02', `word ${w.wordId}`, `wordId が重複しています: ${w.wordId}`)
    wordById.set(w.wordId, w)
    const senseIds = new Set<string>()
    for (const s of w.senses) {
      if (senseIds.has(s.senseId)) c.error('V02', `word ${w.wordId}`, `senseId が重複しています: ${s.senseId}`)
      senseIds.add(s.senseId)
    }
    for (const e of w.examples) {
      if (!senseIds.has(e.senseId)) c.error('V02', `word ${w.wordId}`, `例文 ${e.exId} の senseId が存在しません`)
    }
  }
  const findSense = (wordId: string, senseId: string) =>
    wordById.get(wordId)?.senses.find((s) => s.senseId === senseId)

  const questionKeys = new Set<string>()
  for (const { q, path } of questions) {
    const key = `${q.questionId}@${q.version}`
    if (questionKeys.has(key)) c.error('V02', path, `問題IDと版の組み合わせが重複しています: ${key}`)
    questionKeys.add(key)

    const word = wordById.get(q.wordId)
    const sense = findSense(q.wordId, q.senseId)
    if (!word || !sense) {
      c.error('V02', path, `存在しない単語・語義を参照しています: ${q.wordId}/${q.senseId}`)
      continue
    }
    q.choices.forEach((ch, i) => {
      if (!findSense(ch.fromWordId, ch.fromSenseId))
        c.error('V02', `${path}.choices[${i}]`, `選択肢が存在しない単語・語義を参照しています: ${ch.fromWordId}/${ch.fromSenseId}`)
    })

    const answer = q.choices[q.answerIndex]
    const lang: 'en' | 'ja' = q.type === 'en2ja' ? 'ja' : 'en'

    // 正解の選択肢が対象の単語・語義を指しているか
    if (answer.fromWordId !== q.wordId || answer.fromSenseId !== q.senseId)
      c.error('V03', path, '正解の選択肢が問題の単語・語義を参照していません')

    // V04: 選択肢の重複（正規化後）
    const normalized = q.choices.map((ch) => normalizeChoice(ch.text, lang))
    if (new Set(normalized).size !== normalized.length) c.error('V04', path, '正規化すると重複する選択肢があります')

    // V05: 正解の漏れ
    if (q.type === 'en2ja') {
      if (!word.forms.some((f) => normalizeEn(f) === normalizeEn(q.prompt.text)))
        c.error('V05', path, '英→日の問題文が見出し語・活用形と一致しません')
      if (normalizeJa(q.prompt.text).includes(normalizeJa(answer.text)))
        c.error('V05', path, '問題文に正解の訳が含まれています')
      if (!sense.ja.some((ja) => normalizeJa(ja) === normalizeJa(answer.text)))
        c.error('V03', path, '正解の選択肢が語義の日本語訳と一致しません')
    } else if (q.type === 'ja2en') {
      for (const f of [word.headword, ...word.forms]) {
        if (containsEnglishWord(q.prompt.text, f)) c.error('V05', path, `問題文に正解の英語「${f}」が含まれています`)
      }
    } else {
      const blanks = q.prompt.text.match(BLANK_PATTERN) ?? []
      if (blanks.length !== 1) c.error('V08', path, `空欄(___)はちょうど1か所必要です（現在 ${blanks.length} か所）`)
      const rest = q.prompt.text.replace(BLANK_PATTERN, ' ')
      for (const f of new Set([word.headword, ...word.forms, answer.text])) {
        if (containsEnglishWord(rest, f)) c.error('V05', path, `空欄以外に正解の語「${f}」が含まれています`)
      }
      // V08: 文の形式
      const tokens = q.prompt.text.trim().split(/\s+/)
      if (tokens.length < 6 || tokens.length > 25) c.error('V08', path, `英文は6〜25語にしてください（現在 ${tokens.length} 語）`)
      if (!/[.?!]["”’]?$/.test(q.prompt.text.trim())) c.error('V08', path, '英文の末尾に句読点が必要です')
      if (/\s{2,}/.test(q.prompt.text) || q.prompt.text !== q.prompt.text.trim())
        c.error('V08', path, '余分な空白があります')
    }

    // V06 / V07: 誤答の選択肢
    const targetGlosses = new Set(word.senses.flatMap((s) => s.ja).map(normalizeJa))
    const targetForms = new Set([word.headword, ...word.forms].map(normalizeEn))
    const synonyms = new Set(word.synonyms.map(normalizeEn))
    q.choices.forEach((ch, i) => {
      if (i === q.answerIndex) return
      const p = `${path}.choices[${i}]`
      if (ch.fromWordId === q.wordId) c.error('V06', p, '誤答の選択肢が正解と同じ単語から作られています')
      const from = wordById.get(ch.fromWordId)
      if (from && synonyms.has(normalizeEn(from.headword)))
        c.error('V06', p, `誤答の選択肢「${from.headword}」は正解の類義語として登録されています`)
      if (lang === 'ja' && targetGlosses.has(normalizeJa(ch.text)))
        c.error('V06', p, `誤答の選択肢「${ch.text}」が正解の単語の別の訳と一致します`)
      if (lang === 'en' && targetForms.has(normalizeEn(ch.text)))
        c.error('V06', p, `誤答の選択肢「${ch.text}」が正解の単語の活用形と一致します`)
      const fromSense = findSense(ch.fromWordId, ch.fromSenseId)
      // 穴埋めでは「前置詞か接続詞か」のように品詞の違いを問う出題があるため、警告にとどめて人が判断する
      if (fromSense && fromSense.pos !== sense.pos) {
        const message = `誤答の選択肢の品詞（${fromSense.pos}）が正解（${sense.pos}）と異なります`
        if (q.type === 'cloze') c.warn('V07', p, message)
        else c.error('V07', p, message)
      }
    })

    // V09: 本番データは承認済みのみ
    if (options.mode === 'production' && q.review.status !== 'approved')
      c.error('V09', path, `本番データに未承認の問題が含まれています（${q.review.status}）`)
    if (word.status === 'deprecated' && q.review.status !== 'approved')
      c.warn('V09', path, '廃止済みの単語に新しい問題を追加しようとしています')
  }

  // V10 / V11: 公開済みデータの不変性
  const prev = options.previousManifest
  if (prev) {
    for (const id of prev.wordIds) {
      if (!wordById.has(id)) c.error('V11', `word ${id}`, `公開済みの単語ID ${id} が削除されています（廃止は deprecated で表してください）`)
    }
    const current = new Map(questions.map(({ q }) => [`${q.questionId}@${q.version}`, q]))
    for (const [key, hash] of Object.entries(prev.questionHashes)) {
      const q = current.get(key)
      if (!q) c.error('V10', key, `公開済みの問題 ${key} が削除されています`)
      else if (questionHash(q) !== hash) c.error('V10', key, `公開済みの問題 ${key} の内容が変更されています（version を上げてください）`)
    }
  }

  // V12: 3形式の承認済み問題がそろっているか（警告）
  for (const w of words) {
    if (w.status !== 'active') continue
    const types = new Set(
      questions.filter(({ q }) => q.wordId === w.wordId && q.review.status === 'approved').map(({ q }) => q.type),
    )
    const missing = QUESTION_TYPES.filter((t) => !types.has(t))
    if (missing.length > 0) c.warn('V12', `word ${w.wordId}`, `承認済みの問題がない形式があります: ${missing.join(', ')}`)
  }

  // V13: 例文の重複（警告）
  const seen = new Map<string, string>()
  for (const w of words) {
    for (const e of w.examples) {
      const key = normalizeEn(e.en)
      const other = seen.get(key)
      if (other && other !== w.wordId) c.warn('V13', `word ${w.wordId}`, `例文が ${other} と重複しています`)
      else seen.set(key, w.wordId)
    }
  }

  return c.issues
}
