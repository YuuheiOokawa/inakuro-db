/**
 * イナズマイレブンクロス 型定義
 *
 * ゲーム内データに基づいた正式な型定義ファイル。
 * lib/types.ts はこちらの定義を参照して更新すること。
 *
 * 参照: docs/inazuma-cross-data-research.md
 *       docs/database-design.md
 *       docs/csv-import-format.md
 *
 * 著作権注記: ゲーム内画像・公式画像を無断利用しない前提で設計。
 * imageUrl フィールドは任意とし、非公式ファンサイト等の二次利用に注意すること。
 */

// =============================================================================
// 基本型（マスタ列挙型）
// =============================================================================

/** キャラクターのポジション */
export type Position = "FW" | "MF" | "DF" | "GK";

/** キャラクターの属性（ゲーム内正式表記） */
export type Attribute = "火" | "風" | "山" | "林";

/** キャラクターのレアリティ */
export type Rarity = "星1" | "星2" | "星3";

/**
 * 覚醒ランク（10段階）
 *
 * 星1初期: normal player
 * 星2初期: normal player+
 * 星3初期: growing player
 * 全レアリティ最大: legendary player+
 */
export type AwakeningRank =
  | "normal player"
  | "normal player+"
  | "growing player"
  | "growing player+"
  | "advanced player"
  | "advanced player+"
  | "top player"
  | "top player+"
  | "legendary player"
  | "legendary player+";

/** 覚醒ランクの表示順（比較・進捗計算に使用） */
export const AWAKENING_RANK_ORDER: Readonly<Record<AwakeningRank, number>> = {
  "normal player": 1,
  "normal player+": 2,
  "growing player": 3,
  "growing player+": 4,
  "advanced player": 5,
  "advanced player+": 6,
  "top player": 7,
  "top player+": 8,
  "legendary player": 9,
  "legendary player+": 10,
} as const;

/** 覚醒ランクの日本語表記 */
export const AWAKENING_RANK_JP: Readonly<Record<AwakeningRank, string>> = {
  "normal player": "ノーマルプレイヤー",
  "normal player+": "ノーマルプレイヤー+",
  "growing player": "グロウウィングプレイヤー",
  "growing player+": "グロウウィングプレイヤー+",
  "advanced player": "アドバンスドプレイヤー",
  "advanced player+": "アドバンスドプレイヤー+",
  "top player": "トッププレイヤー",
  "top player+": "トッププレイヤー+",
  "legendary player": "レジェンダリィプレイヤー",
  "legendary player+": "レジェンダリィプレイヤー+",
} as const;

/** レアリティごとの初期覚醒ランク */
export const RARITY_INITIAL_RANK: Readonly<Record<Rarity, AwakeningRank>> = {
  "星1": "normal player",
  "星2": "normal player+",
  "星3": "growing player",
} as const;

/** 全レアリティ共通の最大覚醒ランク */
export const MAX_AWAKENING_RANK: AwakeningRank = "legendary player+";

// =============================================================================
// 素材型
// =============================================================================

/** 素材の種別 */
export type MaterialType = "soul" | "fragment" | "fragment_universal" | "other";

/**
 * 属性のかけら（各属性 + 万能）
 * materialType === "fragment" の場合は attribute が必須
 * materialType === "fragment_universal" の場合は attribute は null
 */
export interface Material {
  id: string;
  name: string;
  materialType: MaterialType;
  /** 属性のかけら専用フィールド。soulの場合はnull */
  attribute: Attribute | null;
  /** 覚醒魂専用フィールド。対象キャラのID。fragmentの場合はnull */
  characterId: string | null;
  obtainMethod: string;
  memo: string;
}

/** ユーザーの素材所持状況 */
export interface UserMaterial {
  id: string;
  materialId: string;
  ownedCount: number;
  memo: string;
}

// =============================================================================
// 覚醒ルート型
// =============================================================================

/**
 * 覚醒ルート（レアリティ別共通マスタ）
 *
 * 各レアリティで from/to の覚醒ランク遷移に必要な素材を定義する。
 * キャラ固有の覚醒魂が必要な段階は characterSpecificSoul = true。
 * 属性のかけらが必要な段階は attributeFragmentRequired = true。
 */
export interface AwakeningRoute {
  id: string;
  rarity: Rarity;
  fromRank: AwakeningRank;
  toRank: AwakeningRank;
  /** 素材種別: soul（覚醒魂）/ fragment（属性のかけら） */
  materialType: "soul" | "fragment";
  requiredCount: number;
  /** true: キャラ固有の覚醒魂が必要 */
  characterSpecificSoul: boolean;
  /** true: 属性に対応したかけらが必要（not 万能） */
  attributeFragmentRequired: boolean;
  memo: string;
}

/**
 * 覚醒ルートマスタデータ
 * docs/database-design.md の AwakeningRoute 初期データに対応
 */
export const AWAKENING_ROUTES: Readonly<AwakeningRoute[]> = [
  // 星3
  { id: "route_s3_1", rarity: "星3", fromRank: "growing player",    toRank: "growing player+",  materialType: "soul",     requiredCount: 1,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s3_2", rarity: "星3", fromRank: "growing player+",   toRank: "advanced player",  materialType: "soul",     requiredCount: 1,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s3_3", rarity: "星3", fromRank: "advanced player",   toRank: "advanced player+", materialType: "fragment", requiredCount: 100, characterSpecificSoul: false, attributeFragmentRequired: true,  memo: "属性のかけら（各属性）" },
  { id: "route_s3_4", rarity: "星3", fromRank: "advanced player+",  toRank: "top player",       materialType: "soul",     requiredCount: 1,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s3_5", rarity: "星3", fromRank: "top player",        toRank: "top player+",      materialType: "soul",     requiredCount: 2,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s3_6", rarity: "星3", fromRank: "top player+",       toRank: "legendary player", materialType: "fragment", requiredCount: 600, characterSpecificSoul: false, attributeFragmentRequired: true,  memo: "属性のかけら（各属性）" },
  { id: "route_s3_7", rarity: "星3", fromRank: "legendary player",  toRank: "legendary player+",materialType: "soul",     requiredCount: 2,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  // 星2
  { id: "route_s2_1", rarity: "星2", fromRank: "normal player+",    toRank: "growing player",   materialType: "soul",     requiredCount: 3,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s2_2", rarity: "星2", fromRank: "growing player",    toRank: "growing player+",  materialType: "soul",     requiredCount: 4,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s2_3", rarity: "星2", fromRank: "growing player+",   toRank: "advanced player",  materialType: "soul",     requiredCount: 5,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s2_4", rarity: "星2", fromRank: "advanced player",   toRank: "advanced player+", materialType: "fragment", requiredCount: 120, characterSpecificSoul: false, attributeFragmentRequired: true,  memo: "属性のかけら（各属性）" },
  { id: "route_s2_5", rarity: "星2", fromRank: "advanced player+",  toRank: "top player",       materialType: "soul",     requiredCount: 8,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s2_6", rarity: "星2", fromRank: "top player",        toRank: "top player+",      materialType: "soul",     requiredCount: 10,  characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s2_7", rarity: "星2", fromRank: "top player+",       toRank: "legendary player", materialType: "fragment", requiredCount: 200, characterSpecificSoul: false, attributeFragmentRequired: true,  memo: "属性のかけら（各属性）" },
  { id: "route_s2_8", rarity: "星2", fromRank: "legendary player",  toRank: "legendary player+",materialType: "soul",     requiredCount: 15,  characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  // 星1
  { id: "route_s1_1", rarity: "星1", fromRank: "normal player",     toRank: "normal player+",   materialType: "soul",     requiredCount: 1,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_2", rarity: "星1", fromRank: "normal player+",    toRank: "growing player",   materialType: "soul",     requiredCount: 3,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_3", rarity: "星1", fromRank: "growing player",    toRank: "growing player+",  materialType: "soul",     requiredCount: 4,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_4", rarity: "星1", fromRank: "growing player+",   toRank: "advanced player",  materialType: "soul",     requiredCount: 5,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_5", rarity: "星1", fromRank: "advanced player",   toRank: "advanced player+", materialType: "soul",     requiredCount: 8,   characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_6", rarity: "星1", fromRank: "advanced player+",  toRank: "top player",       materialType: "soul",     requiredCount: 10,  characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_7", rarity: "星1", fromRank: "top player",        toRank: "top player+",      materialType: "soul",     requiredCount: 12,  characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
  { id: "route_s1_8", rarity: "星1", fromRank: "top player+",       toRank: "legendary player", materialType: "fragment", requiredCount: 200, characterSpecificSoul: false, attributeFragmentRequired: true,  memo: "属性のかけら（各属性）" },
  { id: "route_s1_9", rarity: "星1", fromRank: "legendary player",  toRank: "legendary player+",materialType: "soul",     requiredCount: 20,  characterSpecificSoul: true,  attributeFragmentRequired: false, memo: "" },
] as const;

// =============================================================================
// パッシブスキル型
// =============================================================================

/** パッシブスキルの発動条件種別 */
export type ConditionType = "none" | "teamTag" | "attribute" | "position" | "special";

/** パッシブスキルの効果種別 */
export type EffectType = "stat_up" | "tp_up" | "skill_power" | "crit_up" | "debuff" | "other";

/** パッシブスキルの対象範囲 */
export type TargetScope = "self" | "ally_tag" | "ally_all" | "enemy";

/** パッシブスキルの解放種別 */
export type UnlockType = "level" | "awakening";

/**
 * パッシブスキルマスタ
 *
 * unlockType === "level"     → unlockValue はレベル数（文字列）例: "1" / "11" / "41"
 * unlockType === "awakening" → unlockValue は覚醒ランク名 例: "advanced player"
 */
export interface PassiveSkill {
  id: string;
  name: string;
  description: string;
  activationTiming: string;
  activationCondition: string;
  conditionType: ConditionType;
  conditionTagName: string;
  conditionCount: number;
  effectType: EffectType;
  targetScope: TargetScope;
  targetPosition: Position | "all";
  targetAttribute: Attribute | "all";
  stackable: boolean;
  unlockType: UnlockType;
  /** レベル数（unlockType==="level"）または覚醒ランク名（unlockType==="awakening"） */
  unlockValue: string;
  memo: string;
  sourceUrl: string;
  verificationStatus: "confirmed" | "unverified" | "partial";
}

// =============================================================================
// 必殺技型
// =============================================================================

/** 必殺技の種別 */
export type SpecialMoveType = "shoot" | "dribble" | "catch" | "block";

/** 必殺技マスタ */
export interface SpecialMove {
  id: string;
  name: string;
  type: SpecialMoveType;
  attribute: Attribute | null;
  power: number;
  tpCost: number;
  description: string;
  characterId: string;
}

// =============================================================================
// キャラクター型
// =============================================================================

/** キャラクターの入手方法 */
export type ObtainMethod = "gacha" | "neptuneBoard" | "event" | "story" | "exchange" | "unknown";

/** キャラクターの情報確認状態 */
export type VerificationStatus = "confirmed" | "unverified" | "partial";

/**
 * キャラクターマスタ
 *
 * 同名キャラが複数レアリティで存在する場合は、
 * id を "char_{name}_{s1|s2|s3}" で区別する。
 */
export interface Character {
  id: string;
  name: string;
  /** 肩書き（例: "炎のストライカー"）。ガチャ限定版のみ付与される場合がある。 */
  nickname: string;
  position: Position;
  attribute: Attribute;
  rarity: Rarity;
  team: string;
  series: string;
  obtainMethod: ObtainMethod;
  isGachaLimited: boolean;
  initialAwakeningRank: AwakeningRank;
  maxAwakeningRank: AwakeningRank;
  /** 画像URL（任意。公式画像無断利用禁止。非公式利用時は著作権に注意）。 */
  imageUrl: string;
  memo: string;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
}

/** ユーザーのキャラ管理データ */
export interface UserCharacter {
  id: string;
  characterId: string;
  isOwned: boolean;
  isFavorite: boolean;
  currentAwakeningRank: AwakeningRank;
  memo: string;
  updatedAt: string;
}

/** キャラとパッシブスキルの紐付け */
export interface CharacterPassiveSkill {
  id: string;
  characterId: string;
  passiveSkillId: string;
  sortOrder: number;
}

// =============================================================================
// アプリ全体のデータ型
// =============================================================================

/**
 * localStorage に保存するアプリ全体のデータ構造
 * docs/database-design.md の LocalDB インターフェースに対応
 */
export interface LocalDB {
  characters: Character[];
  awakeningRoutes: AwakeningRoute[];
  passiveSkills: PassiveSkill[];
  characterPassiveSkills: CharacterPassiveSkill[];
  specialMoves: SpecialMove[];
  materials: Material[];
  userCharacters: UserCharacter[];
  userMaterials: UserMaterial[];
}

// =============================================================================
// ユーティリティ型・ヘルパー関数
// =============================================================================

/**
 * 2つの覚醒ランク間のルートを取得する
 * from === to の場合は空配列を返す
 */
export function getAwakeningRoutesBetween(
  rarity: Rarity,
  from: AwakeningRank,
  to: AwakeningRank
): AwakeningRoute[] {
  const fromOrder = AWAKENING_RANK_ORDER[from];
  const toOrder = AWAKENING_RANK_ORDER[to];
  if (fromOrder >= toOrder) return [];
  return AWAKENING_ROUTES.filter(
    (r) =>
      r.rarity === rarity &&
      AWAKENING_RANK_ORDER[r.fromRank] >= fromOrder &&
      AWAKENING_RANK_ORDER[r.toRank] <= toOrder
  );
}

/**
 * 覚醒ランク間で必要な覚醒魂の合計数を計算する
 */
export function calcRequiredSoulCount(
  rarity: Rarity,
  from: AwakeningRank,
  to: AwakeningRank
): number {
  return getAwakeningRoutesBetween(rarity, from, to)
    .filter((r) => r.materialType === "soul")
    .reduce((sum, r) => sum + r.requiredCount, 0);
}

/**
 * 覚醒ランク間で必要な属性のかけらの合計数を計算する
 */
export function calcRequiredFragmentCount(
  rarity: Rarity,
  from: AwakeningRank,
  to: AwakeningRank
): number {
  return getAwakeningRoutesBetween(rarity, from, to)
    .filter((r) => r.materialType === "fragment")
    .reduce((sum, r) => sum + r.requiredCount, 0);
}

/**
 * 覚醒の進捗率（0〜1）を計算する
 * 星1: 0〜9段階, 星2: 0〜8段階, 星3: 0〜7段階
 */
export function calcAwakeningProgress(
  rarity: Rarity,
  currentRank: AwakeningRank
): number {
  const initialRank = RARITY_INITIAL_RANK[rarity];
  const initialOrder = AWAKENING_RANK_ORDER[initialRank];
  const currentOrder = AWAKENING_RANK_ORDER[currentRank];
  const maxOrder = AWAKENING_RANK_ORDER[MAX_AWAKENING_RANK];
  if (maxOrder <= initialOrder) return 1;
  return (currentOrder - initialOrder) / (maxOrder - initialOrder);
}

// =============================================================================
// ユーザー所持データ型（動的データ）
// =============================================================================

/** ユーザーが実際に所持している覚醒ランク（未所持を含む） */
export type OwnedAwakeningRank = AwakeningRank | "未所持"

/** 素材の属性 */
export type MaterialAttribute = "火" | "風" | "林" | "山" | "万能" | "なし"

/**
 * ユーザーのキャラ所持状態（動的データ）
 * キャラクターマスタとは分離し、ユーザーの現在状態として管理する。
 */
export interface UserCharacterState {
  id: string
  rarity: Rarity
  /** ゲーム内覚醒魂アイテム名（例: "[炎のストライカー]豪炎寺　修也の覚醒魂"）*/
  soulName: string
  ownedSoulCount: number
  currentAwakeningRank: OwnedAwakeningRank
  isOwned: boolean
  targetAwakeningRank: AwakeningRank
  characterName: string
  characterVersion?: string
  updatedAt?: string
}

/**
 * ユーザーの素材所持状態（動的データ）
 * 属性のかけら・覚醒魂の在庫を管理する。
 */
export interface UserMaterialState {
  id: string
  name: string
  materialType: "覚醒魂" | "属性のかけら" | "その他"
  attribute: MaterialAttribute
  ownedCount: number
  updatedAt?: string
}
