# イナクロ育成DB

イナズマイレブンクロス キャラクター育成・覚醒データベース Webアプリ（ローカル版）

---

## 概要

イナズマイレブンクロスのキャラクター育成・覚醒素材計算・パッシブスキル管理を行うローカル動作の Web アプリです。

データは **localStorage** に保存されます（サーバー不要）。

---

## セットアップ

```bash
cd inakuro-db
npm install       # 初回のみ
npm run dev       # 開発サーバー起動 → http://localhost:3000
```

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16.2.9 (App Router) |
| 言語 | TypeScript 5 |
| スタイル | Tailwind CSS v4 |
| 状態管理 | React Context + localStorage |
| アイコン | lucide-react |

---

## 画面構成

| URL | 画面名 | 機能 |
|-----|-------|------|
| `/` | ホーム | 統計・クイックアクセス・進捗バー |
| `/characters` | キャラ一覧 | 検索・フィルター（ポジション/属性/レアリティ/検証状態）・所持管理 |
| `/characters/[id]` | キャラ詳細 | 覚醒ルート・必要素材・パッシブスキル・メモ編集 |
| `/awakening` | 覚醒素材計算 | 複数キャラ選択・現在〜目標ランク指定・素材合算・不足表示 |
| `/skills` | パッシブスキル | スキル検索・効果/発動条件/チームタグフィルター |
| `/materials` | 素材一覧 | 所持数編集・必要数計算・不足ハイライト |
| `/progress` | コンプリート進捗 | 達成率・不足素材一覧・キャラ別進捗バー |
| `/admin` | 管理画面 | キャラ追加/編集/削除・パッシブスキル管理・素材所持数編集 |

---

## データ型定義

### 覚醒ランク（10段階）

```
normal player → normal player+ → growing player → growing player+
→ advanced player → advanced player+ → top player → top player+
→ legendary player → legendary player+
```

### レアリティ別初期ランク

| レアリティ | 初期ランク |
|-----------|-----------|
| 星1 | normal player |
| 星2 | normal player+ |
| 星3 | growing player |

### 属性

`火` / `風` / `山` / `林`

---

## 覚醒仕様

### 星3

| from | to | 素材 | 数 |
|------|----|------|---|
| growing player | growing player+ | 覚醒魂 | 1 |
| growing player+ | advanced player | 覚醒魂 | 1 |
| advanced player | advanced player+ | 属性石 | 100 |
| advanced player+ | top player | 覚醒魂 | 1 |
| top player | top player+ | 属性石 | 2 ⚠️要検証 |
| top player+ | legendary player | 属性石 | 600 |
| legendary player | legendary player+ | 覚醒魂 | 2 |

### 星2

| from | to | 素材 | 数 |
|------|----|------|---|
| normal player+ | growing player | 覚醒魂 | 3 |
| growing player | growing player+ | 覚醒魂 | 4 |
| growing player+ | advanced player | 覚醒魂 | 5 |
| advanced player | advanced player+ | 属性石 | 120 |
| advanced player+ | top player | 覚醒魂 | 8 |
| top player | top player+ | 覚醒魂 | 10 |
| top player+ | legendary player | 属性石 | 200 |
| legendary player | legendary player+ | 覚醒魂 | 15 |

### 星1

| from | to | 素材 | 数 |
|------|----|------|---|
| normal player | normal player+ | 覚醒魂 | 1 |
| normal player+ | growing player | 覚醒魂 | 3 |
| growing player | growing player+ | 覚醒魂 | 4 |
| growing player+ | advanced player | 覚醒魂 | 5 |
| advanced player | advanced player+ | 覚醒魂 | 8 |
| advanced player+ | top player | 覚醒魂 | 10 |
| top player | top player+ | 覚醒魂 | 12 |
| top player+ | legendary player | 属性石 | 200 |
| legendary player | legendary player+ | 覚醒魂 | 20 |

---

## 素材について

### 覚醒魂

キャラ専用（ガチャ被りで入手）。素材名 = `{キャラ名}の覚醒魂`

### 属性石

キャラの属性に対応。素材名 = `{属性}の属性石`（例: 火の属性石）

---

## ファイル構成

```
app/               # Next.js ページ
  page.tsx         # ホーム
  characters/      # キャラ一覧・詳細
  awakening/       # 覚醒計算
  skills/          # パッシブスキル
  materials/       # 素材管理
  progress/        # 進捗
  admin/           # 管理画面
components/layout/ # Sidebar
lib/
  types.ts         # 型定義
  store.tsx        # React Context + localStorage
  sampleData.ts    # サンプルデータ（5キャラ）
  utils.ts         # 色関数・表示ユーティリティ
src/
  data/inazuma-cross-master.ts  # マスター定数（覚醒仕様テーブル）
  lib/awakening-calculator.ts  # 覚醒計算ロジック
  types/inazuma-cross.ts       # 詳細型定義（参照用）
docs/                           # 設計ドキュメント
```

---

## 注意事項

- **公式画像は使用しない**設計（`imageUrl` は任意URLのみ対応）
- `⚠️ 要検証` マークが付いているデータは非公式情報または未確認情報です
- localStorage のキーは `inakuro-db-v2`（旧バージョンからの移行不要）

---

## 今後追加すべき機能

- [ ] CSVインポート（`docs/csv-import-format.md` の仕様に沿って実装可能）
- [ ] 覚醒仕様の数値検証と公式確認
- [ ] キャラ画像URL対応（非公式ファンサイト画像URLを手動登録）
- [ ] 必殺技データの追加
- [ ] ガチャ履歴・天井管理
- [ ] Supabase / PostgreSQL へのバックエンド移行（`docs/database-design.md` 参照）
- [ ] PWA対応（オフライン動作）
- [ ] チームビルダー（5キャラパーティ編成ツール）
- [ ] パッシブスキル効果の詳細計算
