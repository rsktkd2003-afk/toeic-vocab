/**
 * 下書き（tools/content/drafts/<name>.ts）から、単語・問題の JSON とレビュー用 CSV を作る。
 *
 * 使い方: npm run content:build-draft -- batch01 [--force]
 *
 * 出力:
 *   content/words/<name>.json
 *   content/questions/<name>.json
 *   content/review/<name>.csv（Excel・Googleスプレッドシートで開ける UTF-8 BOM 付き）
 *
 * レビュー後の JSON を上書きしないよう、出力先が既にある場合は --force がない限り停止する。
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Choice, PartOfSpeech, Question, QuestionsFile, Word, WordsFile } from '../../src/content/types.ts'
import type { DraftWord } from './drafts/types.ts'
import { toReviewCsv } from './review-csv.ts'

const root = resolve(import.meta.dirname, '../..')
const [name, ...flags] = process.argv.slice(2)
if (!name || !/^[a-z0-9-]+$/.test(name)) {
  console.error('下書き名を指定してください（例: npm run content:build-draft -- batch01）')
  process.exit(1)
}
const force = flags.includes('--force')

const draft = (await import(`./drafts/${name}.ts`)) as { dataVersion: string; words: DraftWord[] }

// ---------- 出典リストの読み込み ----------

function readCsvLines(file: string): string[] {
  // TSL のファイルは Latin-1 で保存されている。見出し語は ASCII なので latin1 で読めば十分
  return readFileSync(join(root, 'content/sources', file), 'latin1')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '' && !l.startsWith('#'))
}

function readRanks(file: string, rankColumn: number): Map<string, number> {
  const map = new Map<string, number>()
  for (const line of readCsvLines(file).slice(1)) {
    const cols = line.split(',')
    const rank = Number(cols[rankColumn])
    if (cols[0] && Number.isInteger(rank)) map.set(cols[0].trim().toLowerCase(), rank)
  }
  return map
}

function readForms(file: string): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const line of readCsvLines(file)) {
    const forms = line.split(',').map((f) => f.trim()).filter(Boolean)
    if (forms[0]) map.set(forms[0].toLowerCase(), forms)
  }
  return map
}

const ngslRank = readRanks('NGSL_12_stats.csv', 1)
const tslRank = readRanks('TSL_12_stats.csv', 1)
const forms = new Map([
  ...readForms('TSL_12_lemmatized_for_teaching.csv'),
  ...readForms('NGSL_12_lemmatized_for_teaching.csv'),
])

/** 難易度帯（docs/design.md「難易度帯の決め方」） */
function bandOf(headword: string): { band: Word['band']; list: string; rank: number } {
  const n = ngslRank.get(headword)
  if (n !== undefined) {
    const band = n <= 500 ? 1 : n <= 1000 ? 2 : n <= 1800 ? 3 : 4
    return { band, list: 'NGSL-1.2', rank: n }
  }
  const t = tslRank.get(headword)
  if (t !== undefined) {
    const band = t <= 200 ? 3 : t <= 700 ? 4 : 5
    return { band, list: 'TSL-1.2', rank: t }
  }
  throw new Error(`「${headword}」は NGSL 1.2 にも TSL 1.2 にもありません`)
}

// ---------- 既存データとの照合 ----------

const existingWords: Word[] = []
const wordsDir = join(root, 'content/words')
for (const f of existsSync(wordsDir) ? readdirSync(wordsDir) : []) {
  if (f.endsWith('.json') && f !== `${name}.json`) {
    existingWords.push(...(JSON.parse(readFileSync(join(wordsDir, f), 'utf8')) as WordsFile).words)
  }
}
const existingHeadwords = new Set(existingWords.map((w) => w.headword.toLowerCase()))
let nextId = existingWords.reduce((max, w) => Math.max(max, Number(w.wordId.slice(1))), 0) + 1

const outputs = {
  words: join(root, 'content/words', `${name}.json`),
  questions: join(root, 'content/questions', `${name}.json`),
  review: join(root, 'content/review', `${name}.csv`),
}
if (!force && Object.values(outputs).some(existsSync)) {
  console.error(`${name} の出力が既にあります。レビュー済みの内容を上書きしないよう停止しました（上書きする場合は --force）。`)
  process.exit(1)
}

// ---------- 単語 ----------

const words: Word[] = draft.words.map((d) => {
  if (existingHeadwords.has(d.h)) throw new Error(`「${d.h}」は既に別のファイルに登録されています`)
  const { band, list, rank } = bandOf(d.h)
  const wordId = `w${String(nextId++).padStart(5, '0')}`
  return {
    wordId,
    headword: d.h,
    forms: forms.get(d.h) ?? [d.h],
    senses: [{ senseId: 's1', pos: d.pos, ja: d.ja, primary: true }],
    synonyms: d.syn ?? [],
    pronunciation: { ipa: d.ipa },
    cefr: null,
    band,
    examples: [{ exId: 'e1', senseId: 's1', en: d.ex[0], ja: d.ex[1] }],
    source: { list, rank, license: 'CC BY-SA 4.0' },
    status: 'active',
    addedIn: draft.dataVersion,
  }
})

const byHeadword = new Map(words.map((w) => [w.headword, w]))
const allWords = [...existingWords, ...words]
const findByForm = (text: string): Word => {
  const t = text.toLowerCase()
  const w = allWords.find((x) => x.forms.some((f) => f.toLowerCase() === t))
  if (!w) throw new Error(`語形「${text}」に対応する単語がありません`)
  return w
}
const findByHeadword = (h: string): Word => {
  const w = byHeadword.get(h) ?? existingWords.find((x) => x.headword === h)
  if (!w) throw new Error(`見出し語「${h}」がありません`)
  return w
}

// ---------- 問題 ----------

const POS_JA: Record<PartOfSpeech, string> = {
  noun: '名詞', verb: '動詞', adj: '形容詞', adv: '副詞', prep: '前置詞',
  conj: '接続詞', pron: '代名詞', det: '限定詞', phrase: '句',
}

/** 正解の位置を問題ごとにばらけさせる（表示時にも並べ替える） */
function place(answer: Choice, others: Choice[], questionId: string): { choices: Question['choices']; answerIndex: Question['answerIndex'] } {
  let h = 0
  for (const c of questionId) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const answerIndex = (h % 4) as Question['answerIndex']
  const list = [...others]
  list.splice(answerIndex, 0, answer)
  return { choices: list as Question['choices'], answerIndex }
}

const choiceOf = (w: Word, text: string): Choice => ({ text, fromWordId: w.wordId, fromSenseId: 's1' })
const draftReview = { status: 'draft' as const, reviewedAt: null, note: '' }

const questions: Question[] = []
for (const d of draft.words) {
  const w = findByHeadword(d.h)
  const ja0 = (x: Word) => x.senses[0].ja[0]

  // 英→日
  {
    const others = d.en2ja.map(findByHeadword)
    const questionId = `q-${w.wordId}-en2ja-1`
    questions.push({
      questionId, version: 1, wordId: w.wordId, senseId: 's1', type: 'en2ja',
      prompt: { text: d.h },
      ...place(choiceOf(w, ja0(w)), others.map((o) => choiceOf(o, ja0(o))), questionId),
      explanation: {
        ja: `${d.h}（${POS_JA[d.pos]}）は「${d.ja.join('」「')}」という意味です。例：${d.ex[0]}（${d.ex[1]}） ほかの選択肢：${others.map((o) => `「${ja0(o)}」は ${o.headword}`).join('、')}。`,
      },
      review: { ...draftReview },
    })
  }
  // 日→英
  {
    const others = d.ja2en.d.map(findByHeadword)
    const questionId = `q-${w.wordId}-ja2en-1`
    questions.push({
      questionId, version: 1, wordId: w.wordId, senseId: 's1', type: 'ja2en',
      prompt: { text: d.ja2en.p },
      ...place(choiceOf(w, d.h), others.map((o) => choiceOf(o, o.headword)), questionId),
      explanation: {
        ja: `「${d.ja2en.p}」は ${d.h}（${POS_JA[d.pos]}）です。例：${d.ex[0]}（${d.ex[1]}） ほかの選択肢：${others.map((o) => `${o.headword}＝${ja0(o)}`).join('、')}。`,
      },
      review: { ...draftReview },
    })
  }
  // 英文穴埋め
  {
    const others = d.cloze.d.map((t) => ({ text: t, word: findByForm(t) }))
    const questionId = `q-${w.wordId}-cloze-1`
    questions.push({
      questionId, version: 1, wordId: w.wordId, senseId: 's1', type: 'cloze',
      prompt: { text: d.cloze.s, ja: d.cloze.ja },
      ...place(choiceOf(w, d.cloze.a), others.map((o) => choiceOf(o.word, o.text)), questionId),
      explanation: {
        ja: `${d.cloze.why} 訳：${d.cloze.ja} ほかの選択肢：${others.map((o) => `${o.text}（${ja0(o.word)}）`).join('、')}。`,
      },
      review: { ...draftReview },
    })
  }
}

const wordsFile: WordsFile = { schemaVersion: 1, dataVersion: draft.dataVersion, words }
const questionsFile: QuestionsFile = { schemaVersion: 1, dataVersion: draft.dataVersion, questions }
writeFileSync(outputs.words, `${JSON.stringify(wordsFile, null, 2)}\n`)
writeFileSync(outputs.questions, `${JSON.stringify(questionsFile, null, 2)}\n`)
writeFileSync(outputs.review, toReviewCsv(words.concat(existingWords), questions))
console.log(`単語 ${words.length} 語・問題 ${questions.length} 問を書き出しました: ${name}`)
