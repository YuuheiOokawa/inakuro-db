'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Trophy, Users, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { useApp } from '@/lib/store'
import { calculateRequiredMaterials, calculateMaterialShortage, isMaxAwakening, getAwakeningProgress } from '@/src/lib/awakening-calculator'
import { attributeColor, rarityColor, positionColor, awakeningRankShort, cn } from '@/lib/utils'

export default function ProgressPage() {
  const { characters, materials } = useApp()

  const ownedChars = characters.filter(c => c.isOwned)
  const completedChars = ownedChars.filter(c => isMaxAwakening(c))
  const inProgressChars = ownedChars.filter(c => !isMaxAwakening(c))
  const completePct = ownedChars.length > 0
    ? Math.round((completedChars.length / ownedChars.length) * 100)
    : 0

  // All materials needed for max awakening all owned chars
  const requirements = useMemo(() => {
    if (ownedChars.length === 0) return []
    const selections = ownedChars.map(c => ({ character: c, fromRank: c.currentAwakeningRank, toRank: c.maxAwakeningRank }))
    return calculateRequiredMaterials(selections, materials)
  }, [ownedChars, materials])

  const shortages = useMemo(() => calculateMaterialShortage(requirements), [requirements])

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Trophy size={24} className="text-orange-500" /> コンプリート進捗
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="全キャラ" value={characters.length} icon={<Users size={18} />} color="bg-blue-500" />
        <StatCard label="所持キャラ" value={ownedChars.length} icon={<CheckCircle size={18} />} color="bg-green-500" />
        <StatCard label="最大覚醒済み" value={completedChars.length} icon={<Trophy size={18} />} color="bg-yellow-500" />
        <StatCard label="育成中" value={inProgressChars.length} icon={<AlertCircle size={18} />} color="bg-orange-500" />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
          <span>所持キャラ最大覚醒達成率</span>
          <span className={cn(completePct === 100 ? 'text-green-600' : 'text-blue-600')}>{completePct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={cn('h-4 rounded-full transition-all', completePct === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-green-400')}
            style={{ width: `${completePct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>完了: {completedChars.length}体</span>
          <span>未完了: {inProgressChars.length}体</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Shortage list */}
        <div>
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Package size={16} className="text-red-500" />
            不足素材一覧 ({shortages.length}種)
          </h2>
          {shortages.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-green-700 font-bold">全素材充足！最大覚醒可能です</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shortages.map(req => (
                <div key={req.materialName} className="bg-red-50 border border-red-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{req.materialName}</div>
                    <div className="text-xs text-gray-500">所持 {req.ownedCount} / 必要 {req.requiredCount}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">あと {req.shortage}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Character list */}
        <div>
          <h2 className="font-bold text-gray-700 mb-3">キャラ別覚醒状況</h2>
          <div className="space-y-2">
            {ownedChars.length === 0 ? (
              <p className="text-sm text-gray-400">所持キャラなし</p>
            ) : (
              ownedChars.map(c => {
                const maxed = isMaxAwakening(c)
                const prog = getAwakeningProgress(c)
                return (
                  <Link key={c.id} href={`/characters/${c.id}`}
                    className={cn('block bg-white rounded-xl p-3 shadow-sm border hover:shadow-md transition-all',
                      maxed ? 'border-green-200' : 'border-gray-100')}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', positionColor(c.position))}>{c.position}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border', attributeColor(c.attribute))}>{c.attribute}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', rarityColor(c.rarity))}>{c.rarity}</span>
                      <span className="font-medium text-sm text-gray-800">{c.name}</span>
                      {maxed && <CheckCircle size={14} className="text-green-500 ml-auto" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className={cn('h-1.5 rounded-full', maxed ? 'bg-green-500' : 'bg-yellow-400')}
                          style={{ width: `${prog * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {awakeningRankShort(c.currentAwakeningRank)} → {awakeningRankShort(c.maxAwakeningRank)}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <div className={cn(color, 'text-white rounded-lg p-1.5')}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  )
}
