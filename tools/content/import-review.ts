/**
 * レビュー済み CSV を取り込み、問題データ（content/questions/<name>.json）に反映する。
 *
 * 使い方: npm run content:import-review -- batch01 path/to/batch01.csv
 *
 * - 状態「承認」: review.status を approved にする（内容を修正していれば修正も反映）
 * - 状態「要修正」: draft のまま、メモを保存する（Claude Code が修正して再提出）
 * - 状態「未確認」: 状態は変えない（メモだけ保存）
 * - 公開済み（manifest.lock.json にある）問題の内容は変更できない（version を上げて追加する）
 * - 反映後に品質検証（V01〜V13）を行い、エラーがあれば何も保存しない
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { ContentManifest, Question, QuestionsFile, Word, WordsFile } from '../../src/content/types.ts'
import { applyReviewRows } from './apply-review.ts'
import { parseReviewCsv, toReviewCsv } from './review-csv.ts'
import { validateContent } from './validate.ts'

const root = resolve(import.meta.dirname, '../..')
const [name, csvPath] = process.argv.slice(2)
if (!name || !csvPath) {
  console.error('使い方: npm run content:import-review -- <下書き名> <CSVファイル>')
  process.exit(1)
}

const questionsPath = join(root, 'content/questions', `${name}.json`)
const questionsFile = JSON.parse(readFileSync(questionsPath, 'utf8')) as QuestionsFile

const readAll = <T>(dir: string, pick: (data: never) => T[]): T[] =>
  readdirSync(join(root, 'content', dir))
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => pick(JSON.parse(readFileSync(join(root, 'content', dir, f), 'utf8')) as never))
const allWords: Word[] = readAll('words', (d: WordsFile) => d.words)

const manifestPath = join(root, 'content/manifest.lock.json')
const manifest = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as ContentManifest) : null

const rows = parseReviewCsv(readFileSync(resolve(csvPath), 'utf8'))
const today = new Date().toISOString().slice(0, 10)
const result = applyReviewRows(questionsFile.questions, rows, allWords, manifest, today)

if (result.errors.length > 0) {
  for (const e of result.errors) console.error(`[エラー] ${e}`)
  console.error('\nCSV の内容に問題があるため、何も保存していません。')
  process.exit(1)
}

// 他のファイルの問題も含めて検証する
const otherQuestions: Question[] = readAll('questions', (d: QuestionsFile) => d.questions).filter(
  (q) => !questionsFile.questions.some((x) => x.questionId === q.questionId && x.version === q.version),
)
const issues = validateContent(allWords, [...otherQuestions, ...result.questions], {
  mode: 'dev',
  previousManifest: manifest,
})
const errors = issues.filter((i) => i.level === 'error')
if (errors.length > 0) {
  for (const i of errors) console.error(`[エラー] ${i.code} ${i.path}: ${i.message}`)
  console.error('\n修正内容が品質検証に合格しないため、何も保存していません。')
  process.exit(1)
}

writeFileSync(questionsPath, `${JSON.stringify({ ...questionsFile, questions: result.questions }, null, 2)}\n`)
writeFileSync(join(root, 'content/review', `${name}.csv`), toReviewCsv(allWords, result.questions))
const s = result.summary
console.log(`取り込み完了: 承認 ${s.approved} 問 / 要修正 ${s.needsFix} 問 / 未確認 ${s.unchanged} 問 / 内容を修正 ${s.edited} 問`)
