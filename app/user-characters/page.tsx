'use client'

import { useUserData } from '@/src/lib/user-data-store'
import type { UserCharacterState, OwnedAwakeningRank, AwakeningRank } from '@/src/types/inazuma-cross'
import { cn, rarityColor } from '@/lib/utils'
import { CheckCircle, Circle } from 'lucide-react'

const ALL_AWAKENING_RANKS: AwakeningRank[] = [
  'normal player',
  'normal player+',
  'growing player',
  'growing player+',
  'advanced player',
  'advanced player+',
  'top player',
  'top player+',
  'legendary player',
  'legendary player+',
]

const RANK_SHORT: Record<string, string> = {
  'normal player': 'NP',
  'normal player+': 'NP+',
  'growing player': 'GP',
  'growing player+': 'GP+',
  'advanced player': 'AP',
  'advanced player+': 'AP+',
  'top player': 'TP',
  'top player+': 'TP+',
  'legendary player': 'LP',
  'legendary player+': 'LP+',
}

const RARITY_INITIAL_RANK: Record<string, AwakeningRank> = {
  '星3': 'growing player',
  '星2': 'normal player+',
  '星1': 'normal player',
}

export default function UserCharactersPage() {
  const { characters, updateCharacter } = useUserData()

  const owned = characters.filter(c => c.isOwned)
  const notOwned = characters.filter(c => !c.isOwned)
  const star3 = characters.filter(c => c.rarity === '星3')
  const star2 = characters.filter(c => c.rarity === '星2')
  const star1 = characters.filter(c => c.rarity === '星1')

  return (
    <div className="p-3 lg:p-8 max-w-3xl mx-auto pb-8">
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-lg lg:text-2xl font-bold text-gray-900">所持キャラ管理</h1>
        <span className="text-sm text-gray-400">
          {owned.length}所持 / {notOwned.length}未所持
        </span>
      </div>

      <div className="space-y-5">
        {[
          { label: '星3', chars: star3 },
          { label: '星2', chars: star2 },
          { label: '星1', chars: star1 },
        ].map(({ label, chars }) => (
          <RaritySection key={label} label={label} chars={chars} onUpdate={updateCharacter} />
        ))}
      </div>
    </div>
  )
}

function RaritySection({
  label,
  chars,
  onUpdate,
}: {
  label: string
  chars: UserCharacterState[]
  onUpdate: (id: string, patch: Partial<UserCharacterState>) => void
}) {
  const ownedCount = chars.filter(c => c.isOwned).length
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <span className={cn('text-xs font-bold px-2 py-1 rounded', rarityColor(label))}>
          {label}
        </span>
        <span className="text-sm text-gray-500">
          {ownedCount} / {chars.length} 所持
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {chars.map(char => (
          <CharacterCard key={char.id} char={char} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}

function CharacterCard({
  char,
  onUpdate,
}: {
  char: UserCharacterState
  onUpdate: (id: string, patch: Partial<UserCharacterState>) => void
}) {
  const handleOwnedToggle = () => {
    const newOwned = !char.isOwned
    onUpdate(char.id, {
      isOwned: newOwned,
      currentAwakeningRank: newOwned ? RARITY_INITIAL_RANK[char.rarity] : '未所持',
    })
  }

  const handleRankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(char.id, { currentAwakeningRank: e.target.value as OwnedAwakeningRank })
  }

  const handleSoulCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 0) {
      onUpdate(char.id, { ownedSoulCount: v })
    }
  }

  const isLPPlus = char.currentAwakeningRank === 'legendary player+'

  return (
    <div className={cn('flex items-center gap-3 px-3 py-3', !char.isOwned && 'opacity-50')}>
      {/* 所持トグル */}
      <button
        onClick={handleOwnedToggle}
        className="shrink-0 touch-manipulation"
        style={{ minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {char.isOwned ? (
          <CheckCircle size={22} className="text-green-500" />
        ) : (
          <Circle size={22} className="text-gray-300" />
        )}
      </button>

      {/* キャラ名 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn('text-sm font-semibold', isLPPlus ? 'text-yellow-600' : 'text-gray-800')}>
            {char.characterName}
          </span>
          {isLPPlus && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">LP+</span>
          )}
        </div>
        {char.characterVersion && char.characterVersion !== '★1' && (
          <div className="text-xs text-gray-400 truncate">{char.characterVersion}</div>
        )}
      </div>

      {/* 現在ランク */}
      {char.isOwned ? (
        <select
          value={char.currentAwakeningRank}
          onChange={handleRankChange}
          className="shrink-0 text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-blue-400 touch-manipulation"
          style={{ minHeight: 40, fontSize: 13 }}
        >
          {ALL_AWAKENING_RANKS.map(rank => (
            <option key={rank} value={rank}>{RANK_SHORT[rank]}</option>
          ))}
        </select>
      ) : (
        <span className="shrink-0 text-xs text-gray-300 w-14 text-center">未所持</span>
      )}

      {/* 覚醒魂数 */}
      <div className="shrink-0 flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={char.ownedSoulCount}
          onChange={handleSoulCountChange}
          disabled={!char.isOwned}
          inputMode="numeric"
          className="w-14 text-right border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-300 focus:outline-none focus:border-blue-400 touch-manipulation"
          style={{ minHeight: 40 }}
        />
        <span className="text-xs text-gray-400">魂</span>
      </div>
    </div>
  )
}
