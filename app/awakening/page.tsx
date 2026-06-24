'use client'

import { useState, useMemo } from 'react'
import { Zap, Plus, X, ChevronDown } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useUserData } from '@/src/lib/user-data-store'
import { calculateRequiredMaterials, calculateMaterialShortage } from '@/src/lib/awakening-calculator'
import { AWAKENING_RANKS, AWAKENING_RANK_ORDER } from '@/src/data/inazuma-cross-master'
import { attributeColor, attributeEmoji, positionColor, awakeningRankShort, cn } from '@/lib/utils'
import type { AwakeningRank } from '@/lib/types'

interface Selection {
  characterId: string
  fromRank: AwakeningRank
  toRank: AwakeningRank
}

export default function AwakeningPage() {
  const { characters, materials } = useApp()
  const { materials: userMaterials, characters: userChars } = useUserData()
  const [selections, setSelections] = useState<Selection[]>([])
  const [pickingChar, setPickingChar] = useState(false)
  const [charSearch, setCharSearch] = useState('')

  // ユーザー所持数ルックアップ（属性のかけら）
  const attrOwnedMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of userMaterials) {
      if (m.materialType === '属性のかけら' && m.attribute !== 'なし' && m.attribute !== '万能') {
        map.set(`${m.attribute}の属性石`, m.ownedCount)
      }
    }
    return map
  }, [userMaterials])

  // ユーザー所持数ルックアップ（覚醒魂：スペース除去で正規化）
  const soulOwnedMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const uc of userChars) {
      if (!uc.isOwned) continue
      const key = uc.characterName.replace(/[　\s]/g, '')
      map.set(key, (map.get(key) ?? 0) + uc.ownedSoulCount)
    }
    return map
  }, [userChars])

  const availableChars = characters.filter(c => !selections.find(s => s.characterId === c.id))
  const filteredChars = availableChars.filter(c =>
    !charSearch || c.name.includes(charSearch) || (c.team ?? '').includes(charSearch)
  )

  const addSelection = (charId: string) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    setSelections(prev => [...prev, {
      characterId: charId,
      fromRank: char.currentAwakeningRank,
      toRank: char.maxAwakeningRank,
    }])
    setPickingChar(false)
    setCharSearch('')
  }

  const removeSelection = (charId: string) => {
    setSelections(prev => prev.filter(s => s.characterId !== charId))
  }

  const updateFrom = (charId: string, rank: AwakeningRank) => {
    setSelections(prev => prev.map(s => {
      if (s.characterId !== charId) return s
      const fromOrder = AWAKENING_RANK_ORDER[rank]
      const toOrder = AWAKENING_RANK_ORDER[s.toRank]
      return { ...s, fromRank: rank, toRank: toOrder > fromOrder ? s.toRank : rank }
    }))
  }

  const updateTo = (charId: string, rank: AwakeningRank) => {
    setSelections(prev => prev.map(s => s.characterId === charId ? { ...s, toRank: rank } : s))
  }

  const selectionData = useMemo(() => {
    return selections.map(s => {
      const char = characters.find(c => c.id === s.characterId)
      if (!char) return null
      return { character: char, fromRank: s.fromRank, toRank: s.toRank }
    }).filter(Boolean) as Array<{ character: typeof characters[0]; fromRank: AwakeningRank; toRank: AwakeningRank }>
  }, [selections, characters])

  const rawRequirements = useMemo(() => {
    if (selectionData.length === 0) return []
    return calculateRequiredMaterials(selectionData, materials)
  }, [selectionData, materials])

  // ユーザーデータの所持数で ownedCount / shortage を上書き
  const requirements = useMemo(() => {
    return rawRequirements.map(req => {
      let owned = req.ownedCount
      if (req.materialName.endsWith('の属性石')) {
        owned = attrOwnedMap.get(req.materialName) ?? 0
      } else if (req.materialName.endsWith('の覚醒魂')) {
        const charKey = req.materialName.slice(0, -4).replace(/[　\s]/g, '')
        owned = soulOwnedMap.get(charKey) ?? 0
      }
      return { ...req, ownedCount: owned, shortage: Math.max(0, req.requiredCount - owned) }
    })
  }, [rawRequirements, attrOwnedMap, soulOwnedMap])

  const shortages = useMemo(() => calculateMaterialShortage(requirements), [requirements])

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">覚醒素材計算</h1>
      <p className="text-sm text-gray-500 mb-6">キャラを選択して、現在ランクから目標ランクまでの必要素材を計算します。</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: character selections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700">計算対象キャラ ({selections.length}体)</h2>
            <button
              onClick={() => setPickingChar(v => !v)}
              className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> キャラ追加
            </button>
          </div>

          {/* Character picker */}
          {pickingChar && (
            <div className="bg-white rounded-xl shadow-md border p-3 mb-4">
              <input
                autoFocus
                type="text"
                value={charSearch}
                onChange={e => setCharSearch(e.target.value)}
                placeholder="キャラ名で絞り込み..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredChars.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2 text-center">追加可能なキャラなし</p>
                ) : (
                  filteredChars.map(c => (
                    <button key={c.id} onClick={() => addSelection(c.id)}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                      <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', positionColor(c.position))}>{c.position}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border', attributeColor(c.attribute))}>{attributeEmoji(c.attribute)}</span>
                      <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{awakeningRankShort(c.currentAwakeningRank)}</span>
                    </button>
                  ))
                )}
              </div>
              <button onClick={() => setPickingChar(false)} className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700">
                閉じる
              </button>
            </div>
          )}

          {/* Selected characters */}
          {selections.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
              <Zap size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">「キャラ追加」でキャラクターを選択してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selections.map(sel => {
                const char = characters.find(c => c.id === sel.characterId)
                if (!char) return null
                const availableRanks = AWAKENING_RANKS.filter(r =>
                  AWAKENING_RANK_ORDER[r] >= AWAKENING_RANK_ORDER[char.initialAwakeningRank] &&
                  AWAKENING_RANK_ORDER[r] <= AWAKENING_RANK_ORDER[char.maxAwakeningRank]
                )
                return (
                  <div key={sel.characterId} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded border', attributeColor(char.attribute))}>
                          {attributeEmoji(char.attribute)}
                        </span>
                        <span className="font-bold text-sm text-gray-900">{char.name}</span>
                      </div>
                      <button onClick={() => removeSelection(sel.characterId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <RankSelect
                        label="現在"
                        value={sel.fromRank}
                        options={availableRanks.filter(r => AWAKENING_RANK_ORDER[r] < AWAKENING_RANK_ORDER[char.maxAwakeningRank])}
                        onChange={r => updateFrom(sel.characterId, r)}
                      />
                      <span className="text-gray-400 text-sm">→</span>
                      <RankSelect
                        label="目標"
                        value={sel.toRank}
                        options={availableRanks.filter(r => AWAKENING_RANK_ORDER[r] > AWAKENING_RANK_ORDER[sel.fromRank])}
                        onChange={r => updateTo(sel.characterId, r)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: material results */}
        <div>
          <h2 className="font-bold text-gray-700 mb-3">必要素材</h2>

          {requirements.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
              <p className="text-sm">キャラを追加すると必要素材が表示されます</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {requirements.map(req => (
                  <div key={req.materialName}
                    className={cn('rounded-xl p-3 border flex items-center justify-between',
                      req.shortage > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{req.materialName}</div>
                      <div className="text-xs text-gray-500">所持: {req.ownedCount} / 必要: {req.requiredCount}</div>
                    </div>
                    <div className="text-right ml-4">
                      {req.shortage > 0 ? (
                        <div className="text-sm font-bold text-red-600">不足 {req.shortage}</div>
                      ) : (
                        <div className="text-sm font-bold text-green-600">✓ 充足</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {shortages.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-800 mb-2">不足素材まとめ ({shortages.length}種)</h3>
                  <div className="space-y-1">
                    {shortages.map(req => (
                      <div key={req.materialName} className="flex justify-between text-sm">
                        <span className="text-gray-700">{req.materialName}</span>
                        <span className="font-bold text-red-600">あと {req.shortage} 個</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-bold">✓ 素材は全て充足しています！</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RankSelect({ label, value, options, onChange }: {
  label: string
  value: AwakeningRank
  options: AwakeningRank[]
  onChange: (r: AwakeningRank) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500">{label}:</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value as AwakeningRank)}
          className="text-xs font-medium bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 pr-5 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
        >
          {options.map(r => (
            <option key={r} value={r}>{awakeningRankShort(r)}</option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
