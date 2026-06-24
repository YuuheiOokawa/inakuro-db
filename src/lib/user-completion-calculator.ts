import type { UserCharacterState, UserMaterialState, Rarity, AwakeningRank } from '@/src/types/inazuma-cross'
import { calcRequiredSoulCount } from '@/src/types/inazuma-cross'

export interface UserSoulShortage {
  characterId: string
  characterName: string
  characterVersion?: string
  rarity: Rarity
  soulName: string
  currentAwakeningRank: AwakeningRank
  targetAwakeningRank: AwakeningRank
  requiredSouls: number
  ownedSouls: number
  shortage: number
  pullsNeeded: number
}

export interface UserFragmentSummary {
  id: string
  name: string
  attribute: string
  ownedCount: number
}

export function calculateUserSoulShortages(characters: UserCharacterState[]): UserSoulShortage[] {
  return characters
    .filter(c => c.isOwned && c.currentAwakeningRank !== '未所持')
    .map(c => {
      const currentRank = c.currentAwakeningRank as AwakeningRank
      const requiredSouls = calcRequiredSoulCount(c.rarity, currentRank, c.targetAwakeningRank)
      const shortage = Math.max(0, requiredSouls - c.ownedSoulCount)
      return {
        characterId: c.id,
        characterName: c.characterName,
        characterVersion: c.characterVersion,
        rarity: c.rarity,
        soulName: c.soulName,
        currentAwakeningRank: currentRank,
        targetAwakeningRank: c.targetAwakeningRank,
        requiredSouls,
        ownedSouls: c.ownedSoulCount,
        shortage,
        pullsNeeded: shortage,
      }
    })
    .filter(r => r.shortage > 0)
    .sort((a, b) => b.shortage - a.shortage)
}

export function summarizeUserFragments(materials: UserMaterialState[]): UserFragmentSummary[] {
  return materials
    .filter(m => m.materialType === '属性のかけら')
    .map(m => ({
      id: m.id,
      name: m.name,
      attribute: m.attribute,
      ownedCount: m.ownedCount,
    }))
}
