import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { QuestionsFile, WordsFile } from '../../src/content/types.ts'
import { applyReviewRows } from './apply-review.ts'
import { parseCsv, parseReviewCsv, toReviewCsv } from './review-csv.ts'
import { buildManifest } from './validate.ts'

const root = resolve(import.meta.dirname, '../..')
const words = (JSON.parse(readFileSync(resolve(root, 'content/words/batch01.json'), 'utf8')) as WordsFile).words
const questions = (JSON.parse(readFileSync(resolve(root, 'content/questions/batch01.json'), 'utf8')) as QuestionsFile)
  .questions

const rowsOf = () => parseReviewCsv(toReviewCsv(words, questions))

describe('レビュー CSV', () => {
  it('引用符・カンマ・改行を含むセルを正しく読み書きできる', () => {
    expect(parseCsv('a,"b,c","d""e"\r\n"f\ng",h\r\n')).toEqual([
      ['a', 'b,c', 'd"e'],
      ['f\ng', 'h'],
    ])
  })

  it('書き出した CSV を読み込むと全問題が同じ内容で戻る', () => {
    const rows = rowsOf()
    expect(rows).toHaveLength(questions.length)
    expect(rows[0].問題ID).toBe(questions[0].questionId)
    expect(rows[0].状態).toBe('未確認')
  })

  it('何も変えずに取り込んでも問題データは変わらない', () => {
    const r = applyReviewRows(questions, rowsOf(), words, null, '2026-11-18')
    expect(r.errors).toEqual([])
    expect(r.questions).toEqual(questions)
  })

  it('「承認」で approved になり、「要修正」でメモが保存される', () => {
    const rows = rowsOf()
    rows[0].状態 = '承認'
    rows[1].状態 = '要修正'
    rows[1]['修正内容・メモ'] = '問題文をもっと具体的に'
    const r = applyReviewRows(questions, rows, words, null, '2026-11-18')
    expect(r.errors).toEqual([])
    expect(r.questions[0].review).toEqual({ status: 'approved', reviewedAt: '2026-11-18', note: '' })
    expect(r.questions[1].review.status).toBe('draft')
    expect(r.questions[1].review.note).toBe('問題文をもっと具体的に')
    expect(r.summary).toMatchObject({ approved: 1, needsFix: 1 })
  })

  it('選択肢を別の単語に書き換えると、対応する単語を探し直す', () => {
    const rows = rowsOf()
    const i = questions.findIndex((q) => q.questionId === 'q-w00001-ja2en-1')
    const wrong = [0, 1, 2, 3].find((n) => n !== questions[i].answerIndex)!
    rows[i][`選択肢${wrong + 1}` as '選択肢1'] = 'deadline'
    const r = applyReviewRows(questions, rows, words, null, '2026-11-18')
    expect(r.errors).toEqual([])
    const deadline = words.find((w) => w.headword === 'deadline')!
    expect(r.questions[i].choices[wrong]).toMatchObject({ text: 'deadline', fromWordId: deadline.wordId })
    expect(r.summary.edited).toBe(1)
  })

  it('データにない語や不正な状態はエラーにする', () => {
    const rows = rowsOf()
    rows[0].選択肢1 = '存在しない訳語'
    rows[2].状態 = 'OK'
    rows[3].状態 = '要修正'
    const r = applyReviewRows(questions, rows, words, null, '2026-11-18')
    expect(r.errors).toHaveLength(3)
  })

  it('公開済みの問題の内容は変更できない', () => {
    const manifest = buildManifest('1', words, [{ ...questions[0], review: { status: 'approved', reviewedAt: null, note: '' } }], null)
    const rows = rowsOf()
    rows[0].解説 = '書き換え'
    const r = applyReviewRows(questions, rows, words, manifest, '2026-11-18')
    expect(r.errors[0]).toContain('公開済み')
  })
})
