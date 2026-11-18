import type { PartOfSpeech } from '../../../src/content/types.ts'

/** 下書き用の簡略形式。build-draft.ts で正式な JSON に変換する */
export interface DraftWord {
  h: string
  pos: PartOfSpeech
  ja: string[]
  ipa: string
  syn?: string[]
  ex: [string, string]
  /** 英→日の誤答に使う単語（見出し語、3つ） */
  en2ja: [string, string, string]
  ja2en: { p: string; d: [string, string, string] }
  cloze: { s: string; ja: string; a: string; d: [string, string, string]; why: string }
}
