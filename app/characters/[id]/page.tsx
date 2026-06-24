'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Zap, Edit2, Check, X, ExternalLink } from 'lucide-react'
import { useApp } from '@/lib/store'
import { attributeColor, attributeEmoji, attributeBg, rarityColor, positionColor, verificationColor, verificationEmoji, awakeningRankShort, cn } from '@/lib/utils'
import { getAwakeningRequirements, getMaterialNameForCharacter, isMaxAwakening, getAwakeningProgress } from '@/src/lib/awakening-calculator'
import { AWAKENING_RANKS, AWAKENING_RANK_ORDER } from '@/src/data/inazuma-cross-master'
import type { AwakeningRank } from '@/lib/types'

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { characters, materials, passiveSkills, characterPassiveSkills, toggleOwned, toggleFavorite, updateCharacter } = useApp()

  const char = characters.find(c => c.id === id)
  const charPassiveLinks = characterPassiveSkills.filter(cp => cp.characterId === id)
  const charPassives = charPassiveLinks.map(cp => passiveSkills.find(s => s.id === cp.passiveSkillId)).filter(Boolean)

  const [editingMemo, setEditingMemo] = useState(false)
  const [memoText, setMemoText] = useState(char?.memo ?? '')

  if (!char) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">キャラクターが見つかりません</p>
        <Link href="/characters" className="text-blue-600 mt-4 inline-block">← 一覧に戻る</Link>
      </div>
    )
  }

  const saveMemo = () => {
    updateCharacter(char.id, { memo: memoText })
    setEditingMemo(false)
  }

  const progress = getAwakeningProgress(char)
  const maxed = isMaxAwakening(char)

  // Calculate full awakening route
  const fullRoute = getAwakeningRequirements(char.rarity, char.initialAwakeningRank, char.maxAwakeningRank)

  // Steps from current to max
  const remainingRoute = getAwakeningRequirements(char.rarity, char.currentAwakeningRank, char.maxAwakeningRank)

  // Next single step
  const nextStep = remainingRoute[0] ?? null

  // Total materials needed (current → max)
  const totalNeeded = new Map<string, number>()
  for (const req of remainingRoute) {
    const name = getMaterialNameForCharacter(char, req)
    totalNeeded.set(name, (totalNeeded.get(name) ?? 0) + req.requiredCount)
  }

  const handleRankChange = (rank: AwakeningRank) => {
    updateCharacter(char.id, { currentAwakeningRank: rank })
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Link href="/characters" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm mb-4">
        <ArrowLeft size={16} /> キャラ一覧
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-5 mb-4 text-white flex gap-4">
        <div className={cn('w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border-2 border-white/30', attributeBg(char.attribute))}>
          {char.imageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover rounded-xl" />
            : attributeEmoji(char.attribute)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', positionColor(char.position))}>{char.position}</span>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded', rarityColor(char.rarity))}>{char.rarity}</span>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', attributeColor(char.attribute))}>{char.attribute}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded border', verificationColor(char.verificationStatus))}>
                  {verificationEmoji(char.verificationStatus)} {char.verificationStatus}
                </span>
              </div>
              <h1 className="text-xl font-bold">{char.name}</h1>
              <p className="text-blue-300 text-sm">{char.team ?? ''} {char.series ? `/ ${char.series}` : ''}</p>
            </div>
            <button onClick={() => toggleFavorite(char.id)}
              className={cn('p-2 rounded-full transition-colors', char.isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white')}>
              <Heart size={18} className={char.isFavorite ? 'fill-white' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button onClick={() => toggleOwned(char.id)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold',
                char.isOwned ? 'bg-green-500 text-white' : 'bg-white/20 text-white')}>
              {char.isOwned ? '✓ 所持中' : '未所持'}
            </button>
            <div className="text-xs text-blue-200">
              {char.isGachaLimited ? '🎰 ガチャ限定' : '通常入手'}{char.obtainMethod ? ` / ${char.obtainMethod}` : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Awakening status */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" /> 覚醒ランク
          </h2>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{awakeningRankShort(char.initialAwakeningRank)}</span>
              <span className={cn('font-bold', maxed ? 'text-green-600' : 'text-yellow-600')}>
                {Math.round(progress * 100)}%
              </span>
              <span>{awakeningRankShort(char.maxAwakeningRank)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={cn('h-2.5 rounded-full transition-all', maxed ? 'bg-green-500' : 'bg-yellow-400')}
                style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          {/* Current rank selector */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">現在の覚醒ランク</label>
            <div className="flex flex-wrap gap-1.5">
              {AWAKENING_RANKS.filter(r =>
                AWAKENING_RANK_ORDER[r] >= AWAKENING_RANK_ORDER[char.initialAwakeningRank] &&
                AWAKENING_RANK_ORDER[r] <= AWAKENING_RANK_ORDER[char.maxAwakeningRank]
              ).map(rank => (
                <button key={rank} onClick={() => handleRankChange(rank)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-bold border transition-colors',
                    char.currentAwakeningRank === rank
                      ? 'bg-blue-600 text-white border-blue-600'
                      : AWAKENING_RANK_ORDER[rank] < AWAKENING_RANK_ORDER[char.currentAwakeningRank]
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200',
                  )}>
                  {awakeningRankShort(rank)}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500">現在: </span>
            <span className="font-bold">{char.currentAwakeningRank}</span>
            {!maxed && (
              <>
                <span className="text-gray-400 mx-2">→</span>
                <span className="text-gray-500">最大: </span>
                <span className="font-bold">{char.maxAwakeningRank}</span>
              </>
            )}
            {maxed && <span className="ml-2 text-green-600 font-bold">✓ 最大覚醒達成！</span>}
          </div>
        </div>

        {/* Passive skills */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap size={16} className="text-purple-500" /> パッシブスキル
          </h2>
          {charPassives.length === 0 ? (
            <p className="text-sm text-gray-400">パッシブスキルデータなし</p>
          ) : (
            <div className="space-y-2.5">
              {charPassives.map(skill => skill && (
                <div key={skill.id} className={cn('rounded-lg p-3 border',
                  skill.verificationStatus === '要検証' ? 'bg-yellow-50 border-yellow-200' : 'bg-purple-50 border-purple-100')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-purple-900 text-sm">{skill.name}</div>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded border shrink-0', verificationColor(skill.verificationStatus))}>
                      {verificationEmoji(skill.verificationStatus)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">{skill.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5">発動: {skill.activationCondition}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Next step */}
      {nextStep && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 shadow-sm">
          <h3 className="font-bold text-amber-900 mb-2">次の覚醒ステップ</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
              {awakeningRankShort(nextStep.fromRank)} → {awakeningRankShort(nextStep.toRank)}
            </span>
            <span className="font-medium text-amber-900">
              {getMaterialNameForCharacter(char, nextStep)} × {nextStep.requiredCount}
            </span>
            {nextStep.verificationStatus === '要検証' && (
              <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">⚠️ 要検証</span>
            )}
          </div>
        </div>
      )}

      {/* Full awakening route */}
      <div className="bg-white rounded-xl p-4 mt-4 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-3">覚醒ルート全体</h2>
        {fullRoute.length === 0 ? (
          <p className="text-sm text-gray-400">覚醒データなし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 pr-3">ステップ</th>
                  <th className="text-left py-2 pr-3">素材</th>
                  <th className="text-right py-2 pr-3">必要数</th>
                  <th className="text-right py-2">所持数</th>
                  <th className="text-right py-2">不足</th>
                </tr>
              </thead>
              <tbody>
                {fullRoute.map(req => {
                  const matName = getMaterialNameForCharacter(char, req)
                  const mat = materials.find(m => m.name === matName)
                  const owned = mat?.ownedCount ?? 0
                  const isDone = AWAKENING_RANK_ORDER[req.toRank] <= AWAKENING_RANK_ORDER[char.currentAwakeningRank]
                  const shortage = isDone ? 0 : Math.max(0, req.requiredCount - owned)
                  return (
                    <tr key={req.id} className={cn('border-b', isDone ? 'text-green-600 bg-green-50' : '')}>
                      <td className="py-2 pr-3 font-medium">
                        {awakeningRankShort(req.fromRank)} → {awakeningRankShort(req.toRank)}
                        {isDone && <Check size={12} className="inline ml-1" />}
                      </td>
                      <td className="py-2 pr-3">
                        {matName}
                        {req.verificationStatus === '要検証' && <span className="ml-1 text-yellow-600">⚠️</span>}
                      </td>
                      <td className="py-2 pr-3 text-right font-bold">{req.requiredCount}</td>
                      <td className="py-2 text-right">{owned}</td>
                      <td className={cn('py-2 text-right font-bold', shortage > 0 ? 'text-red-600' : isDone ? 'text-green-600' : 'text-green-600')}>
                        {isDone ? '✓' : shortage > 0 ? `-${shortage}` : '✓'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total needed (current → max) */}
      {totalNeeded.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4 shadow-sm">
          <h3 className="font-bold text-orange-900 mb-3">現在 → 最大覚醒 必要素材合計</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from(totalNeeded.entries()).map(([name, count]) => {
              const mat = materials.find(m => m.name === name)
              const owned = mat?.ownedCount ?? 0
              const shortage = Math.max(0, count - owned)
              return (
                <div key={name} className={cn('rounded-lg p-2.5 border',
                  shortage > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                  <div className="text-xs font-medium text-gray-700 mb-1 truncate">{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn('text-base font-bold', shortage > 0 ? 'text-red-600' : 'text-green-600')}>{count}</span>
                    <span className="text-xs text-gray-400">必要</span>
                  </div>
                  <div className="text-xs text-gray-500">所持: {owned}</div>
                  {shortage > 0 && <div className="text-xs text-red-600 font-bold">不足: {shortage}</div>}
                  {shortage === 0 && <div className="text-xs text-green-600 font-bold">✓ 充足</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Memo */}
      <div className="bg-white rounded-xl p-4 mt-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">メモ</h2>
          {!editingMemo ? (
            <button onClick={() => { setMemoText(char.memo ?? ''); setEditingMemo(true) }}
              className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
              <Edit2 size={12} /> 編集
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveMemo} className="text-xs text-green-600 flex items-center gap-1 hover:underline">
                <Check size={12} /> 保存
              </button>
              <button onClick={() => setEditingMemo(false)} className="text-xs text-gray-500 flex items-center gap-1 hover:underline">
                <X size={12} /> キャンセル
              </button>
            </div>
          )}
        </div>
        {editingMemo ? (
          <textarea value={memoText} onChange={e => setMemoText(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={4} placeholder="自由にメモを入力..." />
        ) : (
          <p className={cn('text-sm', char.memo ? 'text-gray-700' : 'text-gray-400 italic')}>
            {char.memo || 'メモなし（編集ボタンで追加できます）'}
          </p>
        )}
      </div>

      {/* Source info */}
      {char.sourceUrl && (
        <div className="bg-white rounded-xl p-4 mt-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-2">情報ソース</h2>
          <a href={char.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ExternalLink size={14} /> {char.sourceUrl}
          </a>
        </div>
      )}
    </div>
  )
}
