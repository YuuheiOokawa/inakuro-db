import type { Character, Material, AwakeningRank, Rarity } from "@/lib/types"
import { MAX_AWAKENING_RANK } from "@/src/data/inazuma-cross-master"
import {
  getAwakeningRequirements,
  getMaterialNameForCharacter,
} from "./awakening-calculator"

export interface CompletionCharacterInfo {
  id: string
  name: string
  rarity: Rarity
  team: string
  currentAwakeningRank: AwakeningRank
  targetAwakeningRank: AwakeningRank
  contributedCount: number
}

export interface CompletionMaterialDetail {
  materialName: string
  materialType: string
  requiredCount: number
  ownedCount: number
  shortage: number
  characterCount: number
  affectedCharacters: CompletionCharacterInfo[]
}

export interface AttributeShortageEntry {
  rank: number
  attribute: string
  materialName: string
  requiredCount: number
  ownedCount: number
  shortage: number
  characterCount: number
}

export interface SoulShortageEntry {
  rank: number
  materialName: string
  characterName: string
  currentAwakeningRank: AwakeningRank
  targetAwakeningRank: AwakeningRank
  requiredCount: number
  ownedCount: number
  shortage: number
  rarity: Rarity
  team: string
  allCharacters: CompletionCharacterInfo[]
}

export interface DuplicatePullNeed {
  characterName: string
  materialName: string
  soulShortage: number
  pullsNeeded: number
  currentAwakeningRank: AwakeningRank
  targetAwakeningRank: AwakeningRank
  rarity: Rarity
}

/**
 * 所持キャラ全員を legendary player+ にするために必要な素材を集計する。
 * affectedCharacters で「どのキャラがどの素材をいくつ必要か」が追跡できる。
 */
export function calculateOwnedCharactersCompletionMaterials(
  characters: Character[],
  materials: Material[]
): CompletionMaterialDetail[] {
  const ownedChars = characters.filter(c => c.isOwned)

  const matMap = new Map<string, {
    materialType: string
    required: number
    charContributions: CompletionCharacterInfo[]
  }>()

  for (const char of ownedChars) {
    const reqs = getAwakeningRequirements(char.rarity, char.currentAwakeningRank, MAX_AWAKENING_RANK)
    if (reqs.length === 0) continue

    // キャラ単位で素材名ごとに合算
    const charMatMap = new Map<string, { type: string; count: number }>()
    for (const req of reqs) {
      const name = getMaterialNameForCharacter(char, req)
      const existing = charMatMap.get(name)
      if (existing) {
        existing.count += req.requiredCount
      } else {
        charMatMap.set(name, { type: req.materialType, count: req.requiredCount })
      }
    }

    // 全体マップに追加
    for (const [name, { type, count }] of charMatMap.entries()) {
      const charInfo: CompletionCharacterInfo = {
        id: char.id,
        name: char.name,
        rarity: char.rarity,
        team: char.team ?? "",
        currentAwakeningRank: char.currentAwakeningRank,
        targetAwakeningRank: MAX_AWAKENING_RANK,
        contributedCount: count,
      }
      const existing = matMap.get(name)
      if (existing) {
        existing.required += count
        existing.charContributions.push(charInfo)
      } else {
        matMap.set(name, { materialType: type, required: count, charContributions: [charInfo] })
      }
    }
  }

  return Array.from(matMap.entries()).map(([name, { materialType, required, charContributions }]) => {
    const mat = materials.find(m => m.name === name)
    const owned = mat?.ownedCount ?? 0
    return {
      materialName: name,
      materialType,
      requiredCount: required,
      ownedCount: owned,
      shortage: Math.max(0, required - owned),
      characterCount: charContributions.length,
      affectedCharacters: charContributions,
    }
  })
}

/**
 * 属性石の不足数を多い順にランキング化する。
 * 不足数0の属性石も含めて全件返す（所持充足済みも把握できるように）。
 */
export function calculateAttributeShortageRanking(
  completionMaterials: CompletionMaterialDetail[]
): AttributeShortageEntry[] {
  const attributeMats = completionMaterials
    .filter(m => m.materialType === "属性石")
    .sort((a, b) => b.shortage - a.shortage || b.requiredCount - a.requiredCount)

  return attributeMats.map((m, i) => ({
    rank: i + 1,
    attribute: m.materialName.replace("の属性石", ""),
    materialName: m.materialName,
    requiredCount: m.requiredCount,
    ownedCount: m.ownedCount,
    shortage: m.shortage,
    characterCount: m.characterCount,
  }))
}

/**
 * 覚醒魂の不足数を多い順にランキング化する。
 * 不足0のものは除外し、最も不足している魂を上位に表示する。
 * 同名キャラが複数いる場合は最多貢献キャラを代表として使用。
 */
export function calculateSoulShortageRanking(
  completionMaterials: CompletionMaterialDetail[]
): SoulShortageEntry[] {
  const soulMats = completionMaterials
    .filter(m => m.materialType === "覚醒魂" && m.shortage > 0)
    .sort((a, b) => b.shortage - a.shortage)

  return soulMats.map((m, i) => {
    // 最多貢献キャラを代表キャラとして使用
    const sorted = [...m.affectedCharacters].sort((a, b) => b.contributedCount - a.contributedCount)
    const primary = sorted[0]

    return {
      rank: i + 1,
      materialName: m.materialName,
      characterName: primary?.name ?? m.materialName.replace("の覚醒魂", ""),
      currentAwakeningRank: primary?.currentAwakeningRank ?? "growing player",
      targetAwakeningRank: MAX_AWAKENING_RANK,
      requiredCount: m.requiredCount,
      ownedCount: m.ownedCount,
      shortage: m.shortage,
      rarity: primary?.rarity ?? "星3",
      team: primary?.team ?? "",
      allCharacters: sorted,
    }
  })
}

/**
 * 覚醒魂不足数 = 必要な同キャラ被り回数として扱い、ガチャ被り必要数一覧を返す。
 * 1回被り = 覚醒魂1個獲得の前提。将来のガチャ確率拡張に向けてpullsNeededを分離している。
 */
export function calculateDuplicatePullNeeds(
  soulShortageRanking: SoulShortageEntry[]
): DuplicatePullNeed[] {
  return soulShortageRanking.map(s => ({
    characterName: s.characterName,
    materialName: s.materialName,
    soulShortage: s.shortage,
    pullsNeeded: s.shortage, // 現時点: 不足数 = 被り回数（将来はガチャ確率で補正可能）
    currentAwakeningRank: s.currentAwakeningRank,
    targetAwakeningRank: s.targetAwakeningRank,
    rarity: s.rarity,
  }))
}
