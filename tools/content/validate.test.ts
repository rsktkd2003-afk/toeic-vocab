import { describe, expect, it } from 'vitest'
import type { Choice, Question, Word } from '../../src/content/types.ts'
import { buildManifest, questionHash, validateContent, type ValidateOptions } from './validate.ts'

// ---------- テスト用データ（実際の出題データではない） ----------

function word(id: string, headword: string, pos: Word['senses'][number]['pos'], ja: string[], extra: Partial<Word> = {}): Word {
  return {
    wordId: id,
    headword,
    forms: [headword],
    senses: [{ senseId: 's1', pos, ja, primary: true }],
    synonyms: [],
    pronunciation: { ipa: null },
    cefr: null,
    band: 2,
    examples: [{ exId: 'e1', senseId: 's1', en: `Example sentence for ${headword}.`, ja: '例文' }],
    source: { list: 'TEST', rank: null, license: 'test' },
    status: 'active',
    addedIn: '0.0.1',
    ...extra,
  }
}

const words: Word[] = [
  word('w1', 'various', 'adj', ['さまざまな', 'いろいろな'], { synonyms: ['diverse'] }),
  word('w2', 'necessary', 'adj', ['必要な']),
  word('w3', 'accurate', 'adj', ['正確な']),
  word('w4', 'temporary', 'adj', ['一時的な']),
  word('w5', 'despite', 'prep', ['〜にもかかわらず']),
  word('w6', 'although', 'conj', ['〜だけれども']),
  word('w7', 'because', 'conj', ['〜なので']),
  word('w8', 'unless', 'conj', ['〜でない限り']),
  word('w9', 'diverse', 'adj', ['多様な']),
  word('w10', 'invoice', 'noun', ['請求書'], { forms: ['invoice', 'invoices'] }),
]

const ch = (text: string, fromWordId: string): Choice => ({ text, fromWordId, fromSenseId: 's1' })
const approved = { status: 'approved' as const, reviewedAt: '2026-11-18', note: '' }

function en2ja(): Question {
  return {
    questionId: 'q-w1-en2ja-1',
    version: 1,
    wordId: 'w1',
    senseId: 's1',
    type: 'en2ja',
    prompt: { text: 'various' },
    choices: [ch('必要な', 'w2'), ch('さまざまな', 'w1'), ch('正確な', 'w3'), ch('一時的な', 'w4')],
    answerIndex: 1,
    explanation: { ja: 'various は「さまざまな」。' },
    review: { ...approved },
  }
}

function ja2en(): Question {
  return {
    questionId: 'q-w1-ja2en-1',
    version: 1,
    wordId: 'w1',
    senseId: 's1',
    type: 'ja2en',
    prompt: { text: 'さまざまな' },
    choices: [ch('various', 'w1'), ch('necessary', 'w2'), ch('accurate', 'w3'), ch('temporary', 'w4')],
    answerIndex: 0,
    explanation: { ja: '「さまざまな」は various。' },
    review: { ...approved },
  }
}

function cloze(): Question {
  return {
    questionId: 'q-w5-cloze-1',
    version: 1,
    wordId: 'w5',
    senseId: 's1',
    type: 'cloze',
    prompt: { text: 'The meeting was held as scheduled ___ the heavy snow.', ja: '大雪にもかかわらず会議は予定どおり開かれた。' },
    choices: [ch('although', 'w6'), ch('despite', 'w5'), ch('because', 'w7'), ch('unless', 'w8')],
    answerIndex: 1,
    explanation: { ja: 'despite は前置詞なので後ろに名詞が続きます。' },
    review: { ...approved },
  }
}

const dev: ValidateOptions = { mode: 'dev', previousManifest: null }
const errorsOf = (issues: ReturnType<typeof validateContent>) => issues.filter((i) => i.level === 'error')
const codes = (issues: ReturnType<typeof validateContent>) => errorsOf(issues).map((i) => i.code)

// ---------- テスト ----------

describe('validateContent', () => {
  it('正しいデータにはエラーが出ない', () => {
    const issues = validateContent(words, [en2ja(), ja2en(), cloze()], dev)
    expect(errorsOf(issues)).toEqual([])
  })

  it('穴埋めで品詞の異なる誤答は警告にとどめる（V07）', () => {
    const issues = validateContent(words, [cloze()], dev)
    expect(issues.some((i) => i.code === 'V07' && i.level === 'warning')).toBe(true)
  })

  it('V01: 必須項目の欠落を検出する', () => {
    const q = en2ja()
    q.explanation.ja = ''
    expect(codes(validateContent(words, [q], dev))).toContain('V01')
    const w = { ...words[0], examples: [] }
    expect(codes(validateContent([w], [], dev))).toContain('V01')
  })

  it('V02: 問題IDの重複と存在しない参照を検出する', () => {
    expect(codes(validateContent(words, [en2ja(), en2ja()], dev))).toContain('V02')
    const q = en2ja()
    q.choices[0] = ch('必要な', 'w999')
    expect(codes(validateContent(words, [q], dev))).toContain('V02')
  })

  it('V03: 選択肢が4件でない・正解が対象語を指していない場合を検出する', () => {
    const q = en2ja() as unknown as { choices: Choice[] }
    q.choices = q.choices.slice(0, 3)
    expect(codes(validateContent(words, [q], dev))).toContain('V03')
    const q2 = en2ja()
    q2.answerIndex = 0
    expect(codes(validateContent(words, [q2], dev))).toContain('V03')
  })

  it('V04: 正規化すると重複する選択肢を検出する', () => {
    const q = en2ja()
    q.choices[0] = ch('さまざまな。', 'w2')
    expect(codes(validateContent(words, [q], dev))).toContain('V04')
  })

  it('V05: 日→英の問題文に正解の英語が含まれる場合を検出する', () => {
    const q = ja2en()
    q.prompt.text = 'さまざまな（various）'
    expect(codes(validateContent(words, [q], dev))).toContain('V05')
  })

  it('V05: 穴埋めの空欄以外に正解の語がある場合を検出する', () => {
    const q = cloze()
    q.prompt.text = 'Despite the snow, the meeting was held ___ the rain.'
    expect(codes(validateContent(words, [q], dev))).toContain('V05')
  })

  it('V05: 活用形も漏れとして検出する', () => {
    const q: Question = {
      ...ja2en(),
      questionId: 'q-w10',
      wordId: 'w10',
      prompt: { text: '請求書（invoices）' },
      choices: [ch('invoice', 'w10'), ch('necessary', 'w2'), ch('accurate', 'w3'), ch('temporary', 'w4')],
    }
    expect(errorsOf(validateContent(words, [q], dev)).some((i) => i.code === 'V05')).toBe(true)
  })

  it('V06: 類義語や別の訳を誤答に使った場合を検出する', () => {
    const q = ja2en()
    q.choices[1] = ch('diverse', 'w9')
    expect(codes(validateContent(words, [q], dev))).toContain('V06')
    const q2 = en2ja()
    q2.choices[0] = ch('いろいろな', 'w2')
    expect(codes(validateContent(words, [q2], dev))).toContain('V06')
  })

  it('V07: 英→日で品詞の異なる誤答はエラーにする', () => {
    const q = en2ja()
    q.choices[0] = ch('請求書', 'w10')
    expect(codes(validateContent(words, [q], dev))).toContain('V07')
  })

  it('V08: 空欄の数・語数・句読点を検査する', () => {
    const q = cloze()
    q.prompt.text = 'The ___ was held ___ the snow.'
    expect(codes(validateContent(words, [q], dev))).toContain('V08')
    const q2 = cloze()
    q2.prompt.text = 'Held ___ snow.'
    expect(codes(validateContent(words, [q2], dev))).toContain('V08')
    const q3 = cloze()
    q3.prompt.text = 'The meeting was held as scheduled ___ the heavy snow'
    expect(codes(validateContent(words, [q3], dev))).toContain('V08')
  })

  it('V09: 本番モードでは未承認の問題をエラーにする', () => {
    const q = en2ja()
    q.review.status = 'draft'
    expect(codes(validateContent(words, [q], dev))).not.toContain('V09')
    expect(codes(validateContent(words, [q], { mode: 'production', previousManifest: null }))).toContain('V09')
  })

  it('V10/V11: 公開済みの問題の変更と単語IDの削除を検出する', () => {
    const manifest = buildManifest('1', words, [en2ja()], null)
    const changed = en2ja()
    changed.explanation.ja = '書き換えた解説'
    expect(codes(validateContent(words, [changed], { mode: 'dev', previousManifest: manifest }))).toContain('V10')
    expect(codes(validateContent(words, [], { mode: 'dev', previousManifest: manifest }))).toContain('V10')
    expect(codes(validateContent(words.slice(1), [], { mode: 'dev', previousManifest: manifest }))).toContain('V11')
  })

  it('V10: レビュー情報だけの変更は内容の変更とみなさない', () => {
    const a = en2ja()
    const b = en2ja()
    b.review.note = 'メモを追加'
    expect(questionHash(a)).toBe(questionHash(b))
  })

  it('buildManifest は前回の記録を引き継ぐ', () => {
    const first = buildManifest('1', words, [en2ja()], null)
    const second = buildManifest('2', words, [ja2en()], first)
    expect(Object.keys(second.questionHashes).sort()).toEqual(['q-w1-en2ja-1@1', 'q-w1-ja2en-1@1'])
  })

  it('V12/V13: 形式の不足と例文の重複を警告する', () => {
    const dup = word('w11', 'sample', 'noun', ['見本'], {
      examples: [{ exId: 'e1', senseId: 's1', en: 'Example sentence for various.', ja: '例' }],
    })
    const issues = validateContent([...words, dup], [en2ja()], dev)
    expect(issues.some((i) => i.code === 'V12' && i.level === 'warning')).toBe(true)
    expect(issues.some((i) => i.code === 'V13' && i.level === 'warning')).toBe(true)
  })
})
