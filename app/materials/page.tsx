'use client'

import { useState, useMemo } from 'react'
import { Package, Search } from 'lucide-react'
import { useUserData } from '@/src/lib/user-data-store'
import {
  calcRequiredSoulCount,
  type AwakeningRank,
} from '@/src/types/inazuma-cross'
import type { UserCharacterState, UserMaterialState } from '@/src/types/inazuma-cross'
import { attributeColor, cn } from '@/lib/utils'

type FilterType = '覚醒魂' | '属性のかけら' | ''

export default function MaterialsPage() {
  const { characters, materials, updateCharacter, updateMaterial } = useUserData()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('')

  // 所持キャラのみ覚醒魂を表示
  const ownedChars = characters.filter(c => c.isOwned && c.currentAwakeningRank !== '未所持')

  const filteredSouls = useMemo(() => {
    return ownedChars.filter(c => {
      if (filterType === '属性のかけら') return false
      if (search && !c.soulName.includes(search) && !c.characterName.includes(search)) return false
      return true
    })
  }, [ownedChars, search, filterType])

  const filteredFragments = useMemo(() => {
    return materials.filter(m => {
      if (filterType === '覚醒魂') return false
      if (search && !m.name.includes(search)) return false
      return true
    })
  }, [materials, search, filterType])

  const totalSoulShortage = useMemo(() => {
    return ownedChars.reduce((sum, c) => {
      const required = calcRequiredSoulCount(
        c.rarity,
        c.currentAwakeningRank as AwakeningRank,
        c.targetAwakeningRank
      )
      return sum + Math.max(0, required - c.ownedSoulCount)
    }, 0)
  }, [ownedChars])

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package size={24} className="text-green-500" /> 素材一覧
        </h1>
        {totalSoulShortage > 0 && (
          <span className="text-sm text-red-500 font-semibold bg-red-50 px-3 py-1 rounded-full">
            覚醒魂不足合計: {totalSoulShortage}個
          </span>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="素材名・キャラ名で検索..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(['覚醒魂', '属性のかけら'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(prev => prev === t ? '' : t)}
              className={cn(
                'px-2.5 py-2 rounded-xl text-xs font-medium border transition-colors',
                filterType === t
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 覚醒魂テーブル */}
      {filterType !== '属性のかけら' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-bold text-gray-700">
            覚醒魂
            <span className="text-xs font-normal text-gray-400 ml-2">
              所持キャラ {ownedChars.length} 体
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600">素材名（覚醒魂）</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">所持</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">必要</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">不足</th>
                </tr>
              </thead>
              <tbody>
                {filteredSouls.map(char => (
                  <SoulRow key={char.id} char={char} onUpdate={updateCharacter} />
                ))}
                {filteredSouls.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                      見つかりません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 属性のかけらテーブル */}
      {filterType !== '覚醒魂' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-bold text-gray-700">
            属性のかけら
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600">素材名</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">所持</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">必要</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">不足</th>
                </tr>
              </thead>
              <tbody>
                {filteredFragments.map(mat => (
                  <FragmentRow key={mat.id} mat={mat} onUpdate={updateMaterial} />
                ))}
                {filteredFragments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                      見つかりません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        ※「必要」列は現在ランク → 目標ランク（LP+）に必要な総数です。「所持キャラ」ページで所持登録されたキャラのみ表示。
      </p>
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
  const required = calcRequiredSoulCount(
    char.rarity,
    char.currentAwakeningRank as AwakeningRank,
    char.targetAwakeningRank
  )
  const shortage = Math.max(0, required - char.ownedSoulCount)

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 0) onUpdate(char.id, { ownedSoulCount: v })
  }

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-2.5 px-4">
        <div className="font-medium text-gray-800">{char.characterName}</div>
        <div className="text-xs text-gray-400">{char.soulName}</div>
      </td>
      <td className="py-2.5 px-3 text-right">
        <input
          type="number"
          min={0}
          value={char.ownedSoulCount}
          onChange={handleCountChange}
          inputMode="numeric"
          className="w-16 text-right border border-gray-200 rounded-lg px-1.5 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 touch-manipulation"
        />
      </td>
      <td className="py-2.5 px-3 text-right">
        <span className={required > 0 ? 'font-medium text-gray-700' : 'text-gray-400'}>
          {required || '-'}
        </span>
      </td>
      <td className="py-2.5 px-3 text-right">
        {shortage > 0 ? (
          <span className="font-bold text-red-600">-{shortage}</span>
        ) : required > 0 ? (
          <span className="text-green-600 font-bold">✓</span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
    </tr>
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
    if (!isNaN(v) && v >= 0) onUpdate(mat.id, { ownedCount: v })
  }

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-2.5 px-4">
        <div className="font-medium text-gray-800">{mat.name}</div>
        {mat.attribute && mat.attribute !== 'なし' && (
          <span className={cn('text-xs px-1.5 py-0.5 rounded border', attributeColor(mat.attribute))}>
            {mat.attribute}
          </span>
        )}
      </td>
      <td className="py-2.5 px-3 text-right">
        <input
          type="number"
          min={0}
          value={mat.ownedCount}
          onChange={handleCountChange}
          inputMode="numeric"
          className="w-20 text-right border border-gray-200 rounded-lg px-1.5 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 touch-manipulation"
        />
      </td>
      <td className="py-2.5 px-3 text-right text-gray-400">-</td>
      <td className="py-2.5 px-3 text-right text-gray-400">-</td>
    </tr>
  )
}
