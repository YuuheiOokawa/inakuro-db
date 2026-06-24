# イナズマイレブンクロス Webアプリ DB設計案

> 作成日: 2026-06-23  
> 前提: ローカルWebアプリ（Next.js + localStorage / JSON）  
> 将来: Prisma + SQLite / PostgreSQL への移行を想定した設計

---

## 設計方針

1. **正規化を意識しつつ、初期実装はJSONで運用可能な設計**
2. **1キャラが複数パッシブスキルを持つ → 中間テーブル（多対多）**
3. **覚醒素材はレアリティ別に固定ルート → 共通マスタテーブルで管理**
4. **キャラ固有の覚醒魂は Material テーブルで characterId を外部キーとして持つ**
5. **同名キャラが複数レアリティ存在 → id + name + nickname で識別**

---

## テーブル一覧

| テーブル名 | 概要 |
|-----------|------|
| Character | キャラクター基本情報 |
| AwakeningRank | 覚醒ランクマスタ |
| AwakeningRoute | レアリティ別の覚醒ルート定義 |
| UserCharacter | ユーザーのキャラ所持・覚醒状況 |
| PassiveSkill | パッシブスキルマスタ |
| CharacterPassiveSkill | キャラとパッシブの中間テーブル |
| SpecialMove | 必殺技マスタ |
| Material | 素材マスタ |
| UserMaterial | ユーザーの素材所持数 |

---

## テーブル詳細設計

### Character（キャラクターマスタ）

```sql
CREATE TABLE Character (
  id                  TEXT PRIMARY KEY,  -- 例: "char_gouenji_s3"
  name                TEXT NOT NULL,     -- 例: "豪炎寺修也"
  nickname            TEXT,              -- 例: "炎のストライカー" （肩書き）
  position            TEXT NOT NULL,     -- FW / MF / DF / GK
  attribute           TEXT NOT NULL,     -- 火 / 風 / 山 / 林
  rarity              TEXT NOT NULL,     -- 星1 / 星2 / 星3
  team                TEXT,              -- 例: "イナズマジャパン"
  series              TEXT,              -- 例: "イナズマイレブン1" / "クロスオリジナル"
  obtainMethod        TEXT,              -- gacha / neptuneBoard / event / story / exchange
  isGachaLimited      INTEGER DEFAULT 1, -- 1: ガチャ限 / 0: 非ガチャ限
  initialAwakeningRank TEXT NOT NULL,    -- 初期覚醒ランク
  maxAwakeningRank    TEXT NOT NULL,     -- 最大覚醒ランク（常に "legendary player+"）
  imageUrl            TEXT DEFAULT '',   -- 画像URL（任意。著作権配慮で空欄可）
  memo                TEXT DEFAULT '',
  sourceUrl           TEXT,              -- 参照情報源URL
  verificationStatus  TEXT DEFAULT 'unverified'  -- confirmed / unverified / partial
);
```

**補足:**
- `id` は `"char_{姓名ローマ字}_{rarity}"` 形式を推奨（例: `char_gouenji_s3`）
- 同名キャラが複数レアリティに存在する場合は `s1` / `s2` / `s3` サフィックスで区別
- コラボ・イベント版は `_collab` `_event2026` 等のサフィックスを追加
- `initialAwakeningRank` は レアリティと連動（星1→"normal player" / 星2→"normal player+" / 星3→"growing player"）

---

### AwakeningRank（覚醒ランクマスタ）

```sql
CREATE TABLE AwakeningRank (
  id        TEXT PRIMARY KEY,  -- 例: "NP" / "NP+" / "GP" 等
  rankName  TEXT NOT NULL,     -- 例: "normal player"
  rankNameJp TEXT NOT NULL,    -- 例: "ノーマルプレイヤー"
  rankOrder INTEGER NOT NULL   -- 1〜10
);
```

**初期データ:**

| id | rankName | rankNameJp | rankOrder |
|----|---------|-----------|----------|
| NP | normal player | ノーマルプレイヤー | 1 |
| NP+ | normal player+ | ノーマルプレイヤー+ | 2 |
| GP | growing player | グロウウィングプレイヤー | 3 |
| GP+ | growing player+ | グロウウィングプレイヤー+ | 4 |
| AP | advanced player | アドバンスドプレイヤー | 5 |
| AP+ | advanced player+ | アドバンスドプレイヤー+ | 6 |
| TP | top player | トッププレイヤー | 7 |
| TP+ | top player+ | トッププレイヤー+ | 8 |
| LP | legendary player | レジェンダリィプレイヤー | 9 |
| LP+ | legendary player+ | レジェンダリィプレイヤー+ | 10 |

---

### AwakeningRoute（覚醒ルートマスタ）

覚醒に必要な素材をレアリティ別・段階別に定義する共通マスタ。

```sql
CREATE TABLE AwakeningRoute (
  id                         TEXT PRIMARY KEY,
  rarity                     TEXT NOT NULL,      -- 星1 / 星2 / 星3
  fromRank                   TEXT NOT NULL,      -- 開始ランク
  toRank                     TEXT NOT NULL,      -- 到達ランク
  materialType               TEXT NOT NULL,      -- soul (覚醒魂) / fragment (属性のかけら)
  requiredCount              INTEGER NOT NULL,   -- 必要数
  characterSpecificSoul      INTEGER DEFAULT 1, -- 1: キャラ固有の覚醒魂 / 0: 共通素材
  attributeFragmentRequired  INTEGER DEFAULT 0, -- 1: 属性のかけら必要 / 0: 不要
  memo                       TEXT DEFAULT ''
);
```

**初期データ（星3）:**

| id | rarity | fromRank | toRank | materialType | requiredCount | characterSpecificSoul | attributeFragmentRequired |
|----|--------|----------|--------|-------------|--------------|----------------------|--------------------------|
| route_s3_1 | 星3 | growing player | growing player+ | soul | 1 | 1 | 0 |
| route_s3_2 | 星3 | growing player+ | advanced player | soul | 1 | 1 | 0 |
| route_s3_3 | 星3 | advanced player | advanced player+ | fragment | 100 | 0 | 1 |
| route_s3_4 | 星3 | advanced player+ | top player | soul | 1 | 1 | 0 |
| route_s3_5 | 星3 | top player | top player+ | soul | 2 | 1 | 0 |
| route_s3_6 | 星3 | top player+ | legendary player | fragment | 600 | 0 | 1 |
| route_s3_7 | 星3 | legendary player | legendary player+ | soul | 2 | 1 | 0 |

**初期データ（星2）:**

| id | rarity | fromRank | toRank | materialType | requiredCount | characterSpecificSoul | attributeFragmentRequired |
|----|--------|----------|--------|-------------|--------------|----------------------|--------------------------|
| route_s2_1 | 星2 | normal player+ | growing player | soul | 3 | 1 | 0 |
| route_s2_2 | 星2 | growing player | growing player+ | soul | 4 | 1 | 0 |
| route_s2_3 | 星2 | growing player+ | advanced player | soul | 5 | 1 | 0 |
| route_s2_4 | 星2 | advanced player | advanced player+ | fragment | 120 | 0 | 1 |
| route_s2_5 | 星2 | advanced player+ | top player | soul | 8 | 1 | 0 |
| route_s2_6 | 星2 | top player | top player+ | soul | 10 | 1 | 0 |
| route_s2_7 | 星2 | top player+ | legendary player | fragment | 200 | 0 | 1 |
| route_s2_8 | 星2 | legendary player | legendary player+ | soul | 15 | 1 | 0 |

**初期データ（星1）:**

| id | rarity | fromRank | toRank | materialType | requiredCount | characterSpecificSoul | attributeFragmentRequired |
|----|--------|----------|--------|-------------|--------------|----------------------|--------------------------|
| route_s1_1 | 星1 | normal player | normal player+ | soul | 1 | 1 | 0 |
| route_s1_2 | 星1 | normal player+ | growing player | soul | 3 | 1 | 0 |
| route_s1_3 | 星1 | growing player | growing player+ | soul | 4 | 1 | 0 |
| route_s1_4 | 星1 | growing player+ | advanced player | soul | 5 | 1 | 0 |
| route_s1_5 | 星1 | advanced player | advanced player+ | soul | 8 | 1 | 0 |
| route_s1_6 | 星1 | advanced player+ | top player | soul | 10 | 1 | 0 |
| route_s1_7 | 星1 | top player | top player+ | soul | 12 | 1 | 0 |
| route_s1_8 | 星1 | top player+ | legendary player | fragment | 200 | 0 | 1 |
| route_s1_9 | 星1 | legendary player | legendary player+ | soul | 20 | 1 | 0 |

---

### UserCharacter（ユーザーのキャラ管理）

```sql
CREATE TABLE UserCharacter (
  id                   TEXT PRIMARY KEY,
  characterId          TEXT NOT NULL REFERENCES Character(id),
  isOwned              INTEGER DEFAULT 0,  -- 1: 所持 / 0: 未所持
  isFavorite           INTEGER DEFAULT 0,
  currentAwakeningRank TEXT NOT NULL,      -- 現在の覚醒ランク
  memo                 TEXT DEFAULT '',
  updatedAt            TEXT               -- ISO 8601 日付文字列
);
```

---

### PassiveSkill（パッシブスキルマスタ）

```sql
CREATE TABLE PassiveSkill (
  id                   TEXT PRIMARY KEY,     -- 例: "ps_kessoku_kick_ij"
  name                 TEXT NOT NULL,        -- 例: "【結束】キック+"
  description          TEXT NOT NULL,        -- 効果説明
  activationTiming     TEXT,                -- 試合開始時 / ドリブル成功時 / 得点時 など
  activationCondition  TEXT,                -- 条件テキスト（例: イナズマジャパンタグの味方が3人以上）
  conditionType        TEXT,                -- none / teamTag / attribute / position / special
  conditionTagName     TEXT,                -- チームタグ名（例: "イナズマジャパン"）
  conditionCount       INTEGER,             -- 必要人数（例: 3）
  effectType           TEXT,                -- stat_up / tp_up / skill_power / crit / debuff など
  targetScope          TEXT,                -- self / ally / team_tag / all
  targetPosition       TEXT,                -- 対象ポジション（FW/MF/DF/GK/all）
  targetAttribute      TEXT,                -- 対象属性（火/風/山/林/all）
  stackable            INTEGER DEFAULT 0,  -- 1: 重複可 / 0: 重複不可（要検証）
  unlockType           TEXT,               -- level / awakening
  unlockValue          TEXT,               -- レベル数 or 覚醒ランク名
  memo                 TEXT DEFAULT '',
  sourceUrl            TEXT,
  verificationStatus   TEXT DEFAULT 'unverified'
);
```

---

### CharacterPassiveSkill（キャラ × パッシブスキル 中間テーブル）

```sql
CREATE TABLE CharacterPassiveSkill (
  id             TEXT PRIMARY KEY,
  characterId    TEXT NOT NULL REFERENCES Character(id),
  passiveSkillId TEXT NOT NULL REFERENCES PassiveSkill(id),
  sortOrder      INTEGER DEFAULT 0  -- 表示順
);
```

---

### SpecialMove（必殺技マスタ）

```sql
CREATE TABLE SpecialMove (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,     -- 例: "爆炎シュート"
  type        TEXT,              -- shoot / dribble / catch / block
  attribute   TEXT,              -- 技の属性（火/風/山/林）
  power       INTEGER,           -- 威力
  tpCost      INTEGER,           -- TPコスト
  description TEXT,
  characterId TEXT REFERENCES Character(id)
);
```

---

### Material（素材マスタ）

```sql
CREATE TABLE Material (
  id           TEXT PRIMARY KEY,   -- 例: "soul_gouenji" / "frag_fire"
  name         TEXT NOT NULL,      -- 例: "豪炎寺修也の覚醒魂"
  materialType TEXT NOT NULL,      -- soul / fragment / fragment_universal / other
  attribute    TEXT,               -- 属性のかけら用（火/風/山/林）
  characterId  TEXT REFERENCES Character(id),  -- 覚醒魂の場合、対象キャラ
  obtainMethod TEXT,               -- ガチャ被り / 交換所 / 人脈ボード / イベント
  memo         TEXT DEFAULT ''
);
```

---

### UserMaterial（ユーザーの素材所持数）

```sql
CREATE TABLE UserMaterial (
  id         TEXT PRIMARY KEY,
  materialId TEXT NOT NULL REFERENCES Material(id),
  ownedCount INTEGER DEFAULT 0,
  memo       TEXT DEFAULT ''
);
```

---

## ER図（概念）

```
Character
  ├── UserCharacter (1:1 per user)
  ├── CharacterPassiveSkill (1:N)
  │     └── PassiveSkill (N:M)
  ├── SpecialMove (1:N)
  └── Material (soul) (1:1)

AwakeningRoute (共通マスタ。Rarity → from/to → material)
UserMaterial (MaterialIdを参照)
```

---

## ローカル実装時のJSON構造（localStorage用）

```typescript
interface LocalDB {
  characters: Character[]
  awakeningRanks: AwakeningRank[]
  awakeningRoutes: AwakeningRoute[]
  passiveSkills: PassiveSkill[]
  characterPassiveSkills: CharacterPassiveSkill[]
  specialMoves: SpecialMove[]
  materials: Material[]
  userCharacters: UserCharacter[]
  userMaterials: UserMaterial[]
}
```

---

## 旧実装との差分（修正が必要な箇所）

| 項目 | 旧実装 | 修正後 |
|------|-------|-------|
| 属性型 | `'火' \| '風' \| '木' \| '無'` | `'火' \| '風' \| '山' \| '林'` |
| レアリティ型 | `'S' \| 'A' \| 'B' \| 'C'` | `'星1' \| '星2' \| '星3'` |
| 覚醒段階 | 数値（0〜5） | ランク名文字列 |
| 覚醒素材 | materialId参照 | soul/fragment の2種類 |
| パッシブスキル | シンプル構造 | レベル解放/覚醒解放の2種類 + 発動条件詳細 |
| 覚醒ルート | キャラ別管理 | レアリティ共通マスタ + キャラ固有魂 |
