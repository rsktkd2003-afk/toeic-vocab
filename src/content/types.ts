/**
 * 単語・問題データ（出題用データ）の型定義。
 * 学習履歴とは分離し、読み取り専用として扱う。
 * 設計: docs/design.md「3-2. 単語・問題データ」
 */

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'prep'
  | 'conj'
  | 'pron'
  | 'det'
  | 'phrase'

export const PARTS_OF_SPEECH: readonly PartOfSpeech[] = [
  'noun',
  'verb',
  'adj',
  'adv',
  'prep',
  'conj',
  'pron',
  'det',
  'phrase',
]

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const CEFR_LEVELS: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export type QuestionType = 'en2ja' | 'ja2en' | 'cloze'

export const QUESTION_TYPES: readonly QuestionType[] = ['en2ja', 'ja2en', 'cloze']

export type ReviewStatus = 'draft' | 'reviewed' | 'approved'

export type WordStatus = 'active' | 'deprecated'

export interface Sense {
  senseId: string
  pos: PartOfSpeech
  /** 日本語訳（1つ以上） */
  ja: string[]
  primary: boolean
}

export interface Example {
  exId: string
  senseId: string
  en: string
  ja: string
}

export interface WordSource {
  /** 例: "NGSL-1.2", "TSL-1.2" */
  list: string
  rank: number | null
  license: string
}

export interface Word {
  /** 綴りから作らない固定ID。一度使ったIDは再利用しない */
  wordId: string
  headword: string
  /** 活用形・派生形など、正解漏れ検査に使う表記 */
  forms: string[]
  senses: Sense[]
  /** 誤答の選択肢に使ってはいけない類義語（英語の見出し語） */
  synonyms: string[]
  pronunciation: { ipa: string | null }
  /** 出典を確認できた場合のみ設定する */
  cefr: CefrLevel | null
  /** 頻度順位から決める難易度帯 1〜5 */
  band: 1 | 2 | 3 | 4 | 5
  examples: Example[]
  source: WordSource
  status: WordStatus
  addedIn: string
}

export interface Choice {
  text: string
  fromWordId: string
  fromSenseId: string
}

export interface Question {
  questionId: string
  version: number
  wordId: string
  senseId: string
  type: QuestionType
  prompt: {
    /** en2ja: 英単語 / ja2en: 日本語 / cloze: 空欄(___)を1つ含む英文 */
    text: string
    /** cloze の和訳。解答後の解説でのみ表示する */
    ja?: string
  }
  choices: [Choice, Choice, Choice, Choice]
  answerIndex: 0 | 1 | 2 | 3
  explanation: { ja: string }
  review: {
    status: ReviewStatus
    reviewedAt: string | null
    note: string
  }
}

export interface WordsFile {
  schemaVersion: 1
  dataVersion: string
  words: Word[]
}

export interface QuestionsFile {
  schemaVersion: 1
  dataVersion: string
  questions: Question[]
}

/** 公開済みデータの不変性検査（V10/V11）に使う記録 */
export interface ContentManifest {
  dataVersion: string
  wordIds: string[]
  /** key: `${questionId}@${version}` value: 内容のハッシュ値 */
  questionHashes: Record<string, string>
}
