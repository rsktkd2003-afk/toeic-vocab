/** レビュー CSV の各行を問題データに反映する（ファイル入出力なし・テスト可能） */
import type { ContentManifest, Question, Word } from '../../src/content/types.ts'
import { normalizeEn, normalizeJa } from './normalize.ts'
import type { ReviewRow } from './review-csv.ts'

export interface ApplyResult {
  questions: Question[]
  errors: string[]
  summary: { approved: number; needsFix: number; unchanged: number; edited: number }
}

export function applyReviewRows(
  questions: Question[],
  rows: ReviewRow[],
  words: Word[],
  manifest: ContentManifest | null,
  today: string,
): ApplyResult {
  const errors: string[] = []
  const summary = { approved: 0, needsFix: 0, unchanged: 0, edited: 0 }
  const out = questions.map((q) => structuredClone(q))
  const index = new Map(out.map((q, i) => [`${q.questionId}@${q.version}`, i]))
  const seen = new Set<string>()

  for (const row of rows) {
    const key = `${row.問題ID}@${row.版}`
    const at = `${row.問題ID}（版 ${row.版}）`
    if (seen.has(key)) {
      errors.push(`${at}: CSV に同じ問題が2回あります`)
      continue
    }
    seen.add(key)
    const i = index.get(key)
    if (i === undefined) {
      errors.push(`${at}: 該当する問題がありません`)
      continue
    }
    const q = out[i]

    // ---- 内容の修正 ----
    const newChoices = [row.選択肢1, row.選択肢2, row.選択肢3, row.選択肢4]
    const answerNo = Number(row.正解番号)
    const changed =
      row.問題文 !== q.prompt.text ||
      (row.問題文の和訳 || undefined) !== q.prompt.ja ||
      newChoices.some((t, n) => t !== q.choices[n].text) ||
      answerNo !== q.answerIndex + 1 ||
      row.解説 !== q.explanation.ja

    if (changed) {
      if (manifest && key in manifest.questionHashes) {
        errors.push(`${at}: 公開済みの問題は内容を変更できません（新しい版として追加してください）`)
        continue
      }
      if (![1, 2, 3, 4].includes(answerNo)) {
        errors.push(`${at}: 正解番号は1〜4で入力してください`)
        continue
      }
      // 選択肢の文字が変わった場合は、対応する単語を探し直す
      const lang = q.type === 'en2ja' ? 'ja' : 'en'
      let mappingFailed = false
      newChoices.forEach((text, n) => {
        if (text === q.choices[n].text) return
        const found = words.find((w) =>
          lang === 'ja'
            ? w.senses.some((s) => s.ja.some((ja) => normalizeJa(ja) === normalizeJa(text)))
            : w.forms.some((f) => normalizeEn(f) === normalizeEn(text)),
        )
        if (!found) {
          errors.push(`${at}: 選択肢${n + 1}「${text}」に対応する単語がデータにありません`)
          mappingFailed = true
          return
        }
        const sense =
          lang === 'ja'
            ? found.senses.find((s) => s.ja.some((ja) => normalizeJa(ja) === normalizeJa(text)))
            : found.senses[0]
        q.choices[n] = { text, fromWordId: found.wordId, fromSenseId: sense?.senseId ?? found.senses[0].senseId }
      })
      if (mappingFailed) continue
      q.prompt = row.問題文の和訳 ? { text: row.問題文, ja: row.問題文の和訳 } : { text: row.問題文 }
      q.answerIndex = (answerNo - 1) as Question['answerIndex']
      q.explanation = { ja: row.解説 }
      summary.edited++
    }

    // ---- 状態 ----
    q.review.note = row['修正内容・メモ']
    if (row.状態 === '承認') {
      q.review.status = 'approved'
      q.review.reviewedAt = today
      summary.approved++
    } else if (row.状態 === '要修正') {
      q.review.status = 'draft'
      q.review.reviewedAt = today
      summary.needsFix++
      if (!row['修正内容・メモ']) errors.push(`${at}: 「要修正」の場合は修正内容・メモを入力してください`)
    } else if (row.状態 === '未確認' || row.状態 === '') {
      summary.unchanged++
    } else {
      errors.push(`${at}: 状態は「承認」「要修正」「未確認」のいずれかを入力してください（入力値: ${row.状態}）`)
    }
  }

  return { questions: out, errors, summary }
}
