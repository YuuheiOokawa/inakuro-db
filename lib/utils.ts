import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Attribute, Rarity, Position, AwakeningRank, VerificationStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function attributeColor(attr: Attribute | string): string {
  switch (attr) {
    case '火': return 'bg-red-100 text-red-700 border-red-300'
    case '風': return 'bg-sky-100 text-sky-700 border-sky-300'
    case '山': return 'bg-amber-100 text-amber-700 border-amber-300'
    case '林': return 'bg-green-100 text-green-700 border-green-300'
    default:   return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function attributeEmoji(attr: Attribute | string): string {
  switch (attr) {
    case '火': return '🔥'
    case '風': return '💨'
    case '山': return '⛰️'
    case '林': return '🌿'
    default:   return '❓'
  }
}

export function attributeBg(attr: Attribute | string): string {
  switch (attr) {
    case '火': return 'bg-red-50'
    case '風': return 'bg-sky-50'
    case '山': return 'bg-amber-50'
    case '林': return 'bg-green-50'
    default:   return 'bg-gray-50'
  }
}

export function rarityColor(rarity: Rarity | string): string {
  switch (rarity) {
    case '星3': return 'bg-yellow-400 text-yellow-900'
    case '星2': return 'bg-purple-400 text-white'
    case '星1': return 'bg-slate-400 text-white'
    default:    return 'bg-gray-300 text-gray-700'
  }
}

export function positionColor(position: Position | string): string {
  switch (position) {
    case 'FW': return 'bg-red-500 text-white'
    case 'MF': return 'bg-green-500 text-white'
    case 'DF': return 'bg-blue-500 text-white'
    case 'GK': return 'bg-yellow-500 text-white'
    default:   return 'bg-gray-500 text-white'
  }
}

export function verificationColor(status: VerificationStatus | string): string {
  switch (status) {
    case '公式確認済み':   return 'bg-blue-100 text-blue-700 border-blue-300'
    case '非公式確認済み': return 'bg-cyan-100 text-cyan-700 border-cyan-300'
    case '要検証':        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case '不明':          return 'bg-gray-100 text-gray-500 border-gray-200'
    default:              return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

export function verificationEmoji(status: VerificationStatus | string): string {
  switch (status) {
    case '公式確認済み':   return '✅'
    case '非公式確認済み': return '🔵'
    case '要検証':        return '⚠️'
    case '不明':          return '❓'
    default:              return '❓'
  }
}

export function awakeningRankShort(rank: AwakeningRank | string): string {
  const map: Record<string, string> = {
    "normal player":    "NP",
    "normal player+":   "NP+",
    "growing player":   "GP",
    "growing player+":  "GP+",
    "advanced player":  "AP",
    "advanced player+": "AP+",
    "top player":       "TP",
    "top player+":      "TP+",
    "legendary player": "LP",
    "legendary player+":"LP+",
  }
  return map[rank] ?? rank
}
