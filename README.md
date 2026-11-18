# TOEIC 単語学習（個人用）

TOEIC 800点を目標とした、個人用の英単語学習Webアプリです。配布はしません。
設計の詳細と承認済みの決定事項は [docs/design.md](docs/design.md) を参照してください。

## 必要な環境

- Node.js 24 以上（`.nvmrc` 参照）

## コマンド

```bash
npm install
```

```bash
npm run dev               # 開発サーバー
npm run typecheck         # 型チェック
npm run lint              # lint（oxlint）
npm test                  # 自動テスト（Vitest）
npm run validate:content  # 単語・問題データの品質検証（V01〜V13）
npm run build             # 本番ビルド
```

## 単語・問題データ

- `content/words/*.json` と `content/questions/*.json` に置きます（型は `src/content/types.ts`）。
- 見出し語の出典は NGSL 1.2（Browne, C., Culligan, B., & Phillips, J.）と TSL 1.2（Browne, C., & Culligan, B.）です。ライセンスは公式サイトの記載で CC BY-SA 4.0 です。
- 公開済みの問題は書き換えず、`version` を上げた新しい版を追加します。
- 本番に含めるのは、レビューで承認済み（`review.status = "approved"`）の問題だけです。
