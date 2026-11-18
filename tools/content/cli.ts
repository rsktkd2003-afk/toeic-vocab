/**
 * 使い方:
 *   npm run validate:content              # 開発モード（draft を許可）
 *   npm run validate:content -- --production
 *   npm run validate:content -- --write-manifest   # 検証に合格したら公開記録を更新
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { ContentManifest, QuestionsFile, WordsFile } from '../../src/content/types.ts'
import { buildManifest, validateContent } from './validate.ts'

const root = resolve(import.meta.dirname, '../../content')
const args = new Set(process.argv.slice(2))
const production = args.has('--production')
const writeManifest = args.has('--write-manifest')

function readJsonFiles<T>(dir: string): { file: string; data: T }[] {
  const full = join(root, dir)
  if (!existsSync(full)) return []
  return readdirSync(full)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const path = join(full, f)
      try {
        return { file: `${dir}/${f}`, data: JSON.parse(readFileSync(path, 'utf8')) as T }
      } catch (e) {
        throw new Error(`${dir}/${f} を JSON として読み込めません: ${(e as Error).message}`, { cause: e })
      }
    })
}

const wordFiles = readJsonFiles<WordsFile>('words')
const questionFiles = readJsonFiles<QuestionsFile>('questions')
const versions = new Set([...wordFiles, ...questionFiles].map((f) => f.data.dataVersion))
if (versions.size > 1) {
  console.error(`dataVersion がファイル間で一致しません: ${[...versions].join(', ')}`)
  process.exit(1)
}
const dataVersion = [...versions][0] ?? '0.0.0'

const manifestPath = join(root, 'manifest.lock.json')
const previousManifest = existsSync(manifestPath)
  ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as ContentManifest)
  : null

const words = wordFiles.flatMap((f) => f.data.words ?? [])
const questions = questionFiles.flatMap((f) => f.data.questions ?? [])
const issues = validateContent(words, questions, {
  mode: production ? 'production' : 'dev',
  previousManifest,
})

const errors = issues.filter((i) => i.level === 'error')
const warnings = issues.filter((i) => i.level === 'warning')
for (const i of issues) {
  console.log(`[${i.level === 'error' ? 'エラー' : '警告'}] ${i.code} ${i.path}: ${i.message}`)
}
console.log(
  `\n検証結果: 単語 ${words.length} 件 / 問題 ${questions.length} 件 / エラー ${errors.length} 件 / 警告 ${warnings.length} 件`,
)

if (errors.length > 0) process.exit(1)

if (writeManifest) {
  writeFileSync(manifestPath, `${JSON.stringify(buildManifest(dataVersion, words, questions, previousManifest), null, 2)}\n`)
  console.log(`公開記録を更新しました: content/manifest.lock.json`)
}
