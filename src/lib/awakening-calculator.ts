import type { Character, Material, AwakeningRank, Rarity } from "@/lib/types"
import {
  AWAKENING_REQUIREMENTS_BY_RARITY,
  AWAKENING_RANK_ORDER,
  INITIAL_AWAKENING_RANK_BY_RARITY,
} from "@/src/data/inazuma-cross-master"

export interface MaterialRequirement {
  materialName: string
  requiredCount: number
  ownedCount: number
  shortage: number
}

export interface AwakeningSelection {
  character: Character
  fromRank: AwakeningRank
  toRank: AwakeningRank
}

/** レアリティから初期覚醒ランクを返す */
export function getInitialAwakeningRank(rarity: Rarity): AwakeningRank {
  return INITIAL_AWAKENING_RANK_BY_RARITY[rarity]
}

/**
 * レアリティ・現在ランク・目標ランクから必要な覚醒ルートを返す。
 * fromRank → toRank の間にある全ステップを返す。
 */
export function getAwakeningRequirements(
  rarity: Rarity,
  fromRank: AwakeningRank,
  toRank: AwakeningRank
) {
  const fromOrder = AWAKENING_RANK_ORDER[fromRank]
  const toOrder = AWAKENING_RANK_ORDER[toRank]
  if (fromOrder >= toOrder) return []
  const allReqs = AWAKENING_REQUIREMENTS_BY_RARITY[rarity]
  return allReqs.filter(
    (r) =>
      AWAKENING_RANK_ORDER[r.fromRank] >= fromOrder &&
      AWAKENING_RANK_ORDER[r.toRank] <= toOrder
  )
}

/**
 * 素材の実際の名称を返す。
 * - 覚醒魂: "${キャラ名}の覚醒魂"
 * - 属性石: "${キャラ属性}の属性石"
 * - その他: materialNameをそのまま返す
 */
export function getMaterialNameForCharacter(
  character: Character,
  req: { materialType: string; attributeRequired: boolean; characterSpecificSoulRequired: boolean }
): string {
  if (req.materialType === "覚醒魂" && req.characterSpecificSoulRequired) {
    return `${character.name}の覚醒魂`
  }
  if (req.materialType === "属性石" && req.attributeRequired) {
    return `${character.attribute}の属性石`
  }
  return req.materialType
}

/**
 * 複数キャラの覚醒選択から必要素材を合算する。
 * 同名素材（例: 火の属性石）はまとめて加算する。
 */
export function calculateRequiredMaterials(
  selections: AwakeningSelection[],
  materials: Material[]
): MaterialRequirement[] {
  const requiredMap = new Map<string, number>()

  for (const { character, fromRank, toRank } of selections) {
    const reqs = getAwakeningRequirements(character.rarity, fromRank, toRank)
    for (const req of reqs) {
      const name = getMaterialNameForCharacter(character, req)
      requiredMap.set(name, (requiredMap.get(name) ?? 0) + req.requiredCount)
    }
  }

  return Array.from(requiredMap.entries()).map(([name, required]) => {
    const mat = materials.find((m) => m.name === name)
    const owned = mat?.ownedCount ?? 0
    return {
      materialName: name,
      requiredCount: required,
      ownedCount: owned,
      shortage: Math.max(0, required - owned),
    }
  })
}

/**
 * 必要素材と所持素材を比較し、不足数を返す。
 * calculateRequiredMaterials の結果から shortage が 0 より大きいものだけを返す。
 */
export function calculateMaterialShortage(requirements: MaterialRequirement[]): MaterialRequirement[] {
  return requirements.filter((r) => r.shortage > 0)
}

/**
 * 1キャラ分の覚醒進捗率 (0〜1) を返す。
 */
export function getAwakeningProgress(character: Character): number {
  const initialOrder = AWAKENING_RANK_ORDER[character.initialAwakeningRank]
  const currentOrder = AWAKENING_RANK_ORDER[character.currentAwakeningRank]
  const maxOrder = AWAKENING_RANK_ORDER[character.maxAwakeningRank]
  const range = maxOrder - initialOrder
  if (range <= 0) return 1
  return (currentOrder - initialOrder) / range
}

/**
 * 最大覚醒まで完了しているかどうかを返す。
 */
export function isMaxAwakening(character: Character): boolean {
  return character.currentAwakeningRank === character.maxAwakeningRank
}
