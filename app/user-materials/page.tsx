'use client'

import { useUserData } from '@/src/lib/user-data-store'
import type { UserCharacterState, UserMaterialState } from '@/src/types/inazuma-cross'
import { cn, attributeColor, rarityColor } from '@/lib/utils'
import { Package } from 'lucide-react'

type SoulGroup = {
  label: string
  chars: UserCharacterState[]
}

function buildSoulGroups(characters: UserCharacterState[]): SoulGroup[] {
  const star3 = characters.filter(c => c.rarity === '星3')
  const star2 = characters.filter(c => c.rarity === '星2')
  const star1_marked = characters.filter(
    c => c.rarity === '星1' && c.characterVersion === '★1'
  )
  const star1_plain = characters.filter(
    c => c.rarity === '星1' && c.characterVersion !== '★1'
  )
  return [
    { label: '覚醒魂（星3）', chars: star3 },
    { label: '覚醒魂（星2）', chars: star2 },
    { label: '覚醒魂（★1キャラ）', chars: star1_marked },
    { label: '覚醒魂（星1 バージョンなし）', chars: star1_plain },
  ].filter(g => g.chars.length > 0)
}

export default function UserMaterialsPage() {
  const { characters, materials, updateCharacter, updateMaterial } = useUserData()

  const fragments = materials.filter(m => m.materialType === '属性のかけら')
  const fragmentTotal = fragments.reduce((s, m) => s + m.ownedCount, 0)

  const soulGroups = buildSoulGroups(characters)
  const soulTotal = characters
    .filter(c => c.isOwned)
    .reduce((s, c) => s + c.ownedSoulCount, 0)

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package size={24} className="text-amber-500" /> 素材管理
        </h1>
      </div>

      {/* 覚醒魂セクション */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-bold text-gray-700 text-sm">覚醒魂</h2>
          <span className="text-xs text-gray-400">合計 {soulTotal} 個（所持キャラのみ）</span>
        </div>
        <div className="space-y-4">
          {soulGroups.map(group => (
            <SoulGroupCard
              key={group.label}
              group={group}
              onUpdate={updateCharacter}
            />
          ))}
        </div>
      </div>

      {/* 属性のかけらセクション */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-bold text-gray-700 text-sm">属性のかけら</h2>
          <span className="text-xs text-gray-400">合計 {fragmentTotal.toLocaleString()} 個</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {fragments.map(mat => (
              <FragmentRow key={mat.id} mat={mat} onUpdate={updateMaterial} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SoulGroupCard({
  group,
  onUpdate,
}: {
  group: SoulGroup
  onUpdate: (id: string, patch: Partial<UserCharacterState>) => void
}) {
  const rarity = group.chars[0]?.rarity
  const totalOwned = group.chars
    .filter(c => c.isOwned)
    .reduce((s, c) => s + c.ownedSoulCount, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
        {rarity && (
          <span className={cn('text-xs font-bold px-2 py-0.5 rounded', rarityColor(rarity))}>
            {group.label.includes('★1キャラ') ? '★1' : rarity}
          </span>
        )}
        <span className="text-sm font-semibold text-gray-700">{group.label}</span>
        <span className="text-xs text-gray-400 ml-auto">所持合計 {totalOwned} 個</span>
      </div>
      <div className="divide-y divide-gray-50">
        {group.chars.map(char => (
          <SoulRow key={char.id} char={char} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}

function SoulRow({
  char,
  onUpdate,
}: {
  char: UserCharacterState
  onUpdate: (id: string, patch: Partial<UserCharacterState>) => void
}) {
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 0) {
      onUpdate(char.id, { ownedSoulCount: v })
    }
  }

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3',
      !char.isOwned && 'opacity-40'
    )}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {char.characterName}
        </div>
        <div className="text-xs text-gray-400 truncate">{char.soulName}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={0}
          value={char.ownedSoulCount}
          onChange={handleCountChange}
          disabled={!char.isOwned}
          inputMode="numeric"
          className="w-16 text-right border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-300 focus:outline-none focus:border-blue-400 touch-manipulation"
          style={{ minHeight: 40 }}
        />
        <span className="text-xs text-gray-400">個</span>
      </div>
    </div>
  )
}

function FragmentRow({
  mat,
  onUpdate,
}: {
  mat: UserMaterialState
  onUpdate: (id: string, patch: Partial<UserMaterialState>) => void
}) {
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 0) {
      onUpdate(mat.id, { ownedCount: v })
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={cn(
        'text-sm font-bold px-3 py-1.5 rounded-full border min-w-[3rem] text-center',
        attributeColor(mat.attribute)
      )}>
        {mat.attribute}
      </span>
      <span className="flex-1 text-sm font-medium text-gray-800">{mat.name}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={mat.ownedCount}
          onChange={handleCountChange}
          inputMode="numeric"
          className="w-24 text-right border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 touch-manipulation"
          style={{ minHeight: 44 }}
        />
        <span className="text-xs text-gray-400">個</span>
      </div>
    </div>
  )
}
