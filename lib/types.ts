export type Position = "FW" | "MF" | "DF" | "GK"
export type Attribute = "火" | "風" | "山" | "林"
export type Rarity = "星1" | "星2" | "星3"

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
  | "legendary player+"

export type MaterialType = "覚醒魂" | "属性石" | "その他"

export type VerificationStatus = "公式確認済み" | "非公式確認済み" | "要検証" | "不明"

export interface Character {
  id: string
  name: string
  position: Position
  attribute: Attribute
  rarity: Rarity
  team?: string
  series?: string
  obtainMethod?: string
  isGachaLimited: boolean
  initialAwakeningRank: AwakeningRank
  currentAwakeningRank: AwakeningRank
  maxAwakeningRank: AwakeningRank
  imageUrl?: string
  isOwned: boolean
  isFavorite: boolean
  memo?: string
  sourceUrl?: string
  verificationStatus: VerificationStatus
}

export interface AwakeningRequirement {
  id: string
  rarity: Rarity
  fromRank: AwakeningRank
  toRank: AwakeningRank
  materialType: MaterialType
  materialName: string
  requiredCount: number
  attributeRequired: boolean
  characterSpecificSoulRequired: boolean
  verificationStatus: VerificationStatus
  memo?: string
}

export interface PassiveSkill {
  id: string
  name: string
  description: string
  activationCondition: string
  effectType?: string
  targetPosition?: Position
  targetAttribute?: Attribute
  targetTeam?: string
  stackable?: boolean
  memo?: string
  sourceUrl?: string
  verificationStatus: VerificationStatus
}

export interface CharacterPassiveSkill {
  id: string
  characterId: string
  passiveSkillId: string
}

export interface Material {
  id: string
  name: string
  materialType: MaterialType
  attribute?: Attribute
  ownedCount: number
  obtainMethod?: string
  memo?: string
}

export interface AppData {
  characters: Character[]
  passiveSkills: PassiveSkill[]
  characterPassiveSkills: CharacterPassiveSkill[]
  materials: Material[]
}
