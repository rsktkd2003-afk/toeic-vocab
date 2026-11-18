/**
 * レビュー用 CSV の書き出しと読み込み。
 * Excel・Googleスプレッドシートで文字化けしないよう UTF-8（BOM 付き）で書き出す。
 */
import type { PartOfSpeech, Question, QuestionType, Word } from '../../src/content/types.ts'

export const REVIEW_HEADERS = [
  '問題ID',
  '版',
  '形式',
  '単語',
  '品詞',
  '問題文',
  '問題文の和訳',
  '選択肢1',
  '選択肢2',
  '選択肢3',
  '選択肢4',
  '正解番号',
  '解説',
  '状態',
  '修正内容・メモ',
] as const

export type ReviewRow = Record<(typeof REVIEW_HEADERS)[number], string>

/** 状態の列に入れる値 */
export const REVIEW_STATES = ['未確認', '承認', '要修正'] as const

const TYPE_JA: Record<QuestionType, string> = { en2ja: '英→日', ja2en: '日→英', cloze: '英文穴埋め' }
const POS_JA: Record<PartOfSpeech, string> = {
  noun: '名詞', verb: '動詞', adj: '形容詞', adv: '副詞', prep: '前置詞',
  conj: '接続詞', pron: '代名詞', det: '限定詞', phrase: '句',
}

function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function toReviewCsv(words: Word[], questions: Question[]): string {
  const byId = new Map(words.map((w) => [w.wordId, w]))
  const lines = [REVIEW_HEADERS.join(',')]
  for (const q of questions) {
    const w = byId.get(q.wordId)
    const pos = w?.senses.find((s) => s.senseId === q.senseId)?.pos
    const state = q.review.status === 'approved' ? '承認' : q.review.note ? '要修正' : '未確認'
    const row: ReviewRow = {
      問題ID: q.questionId,
      版: String(q.version),
      形式: TYPE_JA[q.type],
      単語: w?.headword ?? '',
      品詞: pos ? POS_JA[pos] : '',
      問題文: q.prompt.text,
      問題文の和訳: q.prompt.ja ?? '',
      選択肢1: q.choices[0].text,
      選択肢2: q.choices[1].text,
      選択肢3: q.choices[2].text,
      選択肢4: q.choices[3].text,
      正解番号: String(q.answerIndex + 1),
      解説: q.explanation.ja,
      状態: state,
      '修正内容・メモ': q.review.note,
    }
    lines.push(REVIEW_HEADERS.map((h) => escapeCell(row[h])).join(','))
  }
  return `﻿${lines.join('\r\n')}\r\n`
}

/** RFC 4180 形式の CSV を読み込む（引用符内の改行・カンマに対応） */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

export function parseReviewCsv(text: string): ReviewRow[] {
  const [header, ...body] = parseCsv(text)
  if (!header) throw new Error('CSV が空です')
  const index = REVIEW_HEADERS.map((h) => header.indexOf(h))
  const missing = REVIEW_HEADERS.filter((_, i) => index[i] === -1)
  if (missing.length > 0) throw new Error(`CSV に必要な列がありません: ${missing.join('、')}`)
  return body.map((cells) => {
    const row = {} as ReviewRow
    REVIEW_HEADERS.forEach((h, i) => {
      row[h] = (cells[index[i]] ?? '').trim()
    })
    return row
  })
}
