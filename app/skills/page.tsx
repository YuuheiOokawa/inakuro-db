'use client'

import { useState, useMemo } from 'react'
import { Sparkles, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/lib/store'
import { attributeColor, attributeEmoji, positionColor, verificationColor, verificationEmoji, cn } from '@/lib/utils'
import { POSITIONS, ATTRIBUTES } from '@/src/data/inazuma-cross-master'
import type { Position, Attribute, VerificationStatus } from '@/lib/types'

const VERIFICATION_STATUSES: VerificationStatus[] = ['公式確認済み', '非公式確認済み', '要検証', '不明']

export default function SkillsPage() {
  const { passiveSkills, characterPassiveSkills, characters } = useApp()
  const [query, setQuery] = useState('')
  const [filterPos, setFilterPos] = useState<Position | ''>('')
  const [filterAttr, setFilterAttr] = useState<Attribute | ''>('')
  const [filterVerification, setFilterVerification] = useState<VerificationStatus | ''>('')
  const [filterTeam, setFilterTeam] = useState('')

  const teams = useMemo(() => Array.from(new Set(characters.flatMap(c => c.team ? [c.team] : []))).sort(), [characters])

  // Build skill-to-character map
  const skillCharMap = useMemo(() => {
    const map = new Map<string, typeof characters>()
    for (const link of characterPassiveSkills) {
      const char = characters.find(c => c.id === link.characterId)
      if (!char) continue
      if (!map.has(link.passiveSkillId)) map.set(link.passiveSkillId, [])
      map.get(link.passiveSkillId)!.push(char)
    }
    return map
  }, [characterPassiveSkills, characters])

  const filtered = useMemo(() => {
    return passiveSkills.filter(skill => {
      if (query && !skill.name.includes(query) && !skill.description.includes(query) && !skill.activationCondition.includes(query)) return false
      if (filterVerification && skill.verificationStatus !== filterVerification) return false
      if (filterTeam && !(skill.targetTeam ?? '').includes(filterTeam)) return false
      // Position/Attribute filter by related characters
      const chars = skillCharMap.get(skill.id) ?? []
      if (filterPos && !chars.some(c => c.position === filterPos)) return false
      if (filterAttr && skill.targetAttribute !== filterAttr && !chars.some(c => c.attribute === filterAttr)) return false
      return true
    })
  }, [passiveSkills, query, filterPos, filterAttr, filterVerification, filterTeam, skillCharMap])

  const clearFilters = () => {
    setFilterPos(''); setFilterAttr(''); setFilterVerification(''); setFilterTeam('')
  }

  const activeCount = [filterPos, filterAttr, filterVerification, filterTeam].filter(Boolean).length

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Sparkles size={24} className="text-purple-500" /> パッシブスキル
      </h1>
      <p className="text-sm text-gray-500 mb-4">{filtered.length} / {passiveSkills.length} 件表示</p>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="スキル名・効果・発動条件で検索..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">フィルター</span>
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-500">クリア</button>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">ポジション（キャラ）</label>
            <div className="flex flex-wrap gap-1.5">
              {POSITIONS.map(p => (
                <button key={p} onClick={() => setFilterPos(prev => prev === p ? '' : p)}
                  className={cn('px-2 py-0.5 rounded-full text-xs font-bold border transition-colors',
                    filterPos === p ? positionColor(p) : 'bg-gray-100 text-gray-600 border-transparent')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">属性（キャラ）</label>
            <div className="flex flex-wrap gap-1.5">
              {ATTRIBUTES.map(a => (
                <button key={a} onClick={() => setFilterAttr(prev => prev === a ? '' : a)}
                  className={cn('px-2 py-0.5 rounded-full text-xs font-bold border transition-colors',
                    filterAttr === a ? attributeColor(a) : 'bg-gray-100 text-gray-600 border-transparent')}>
                  {attributeEmoji(a)} {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">対象チーム</label>
              <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white">
                <option value="">すべて</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">検証ステータス</label>
              <select value={filterVerification} onChange={e => setFilterVerification(e.target.value as VerificationStatus | '')}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white">
                <option value="">すべて</option>
                {VERIFICATION_STATUSES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Skill list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
          <p>条件に一致するスキルが見つかりません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(skill => {
            const chars = skillCharMap.get(skill.id) ?? []
            return (
              <div key={skill.id} className={cn('bg-white rounded-xl p-4 shadow-sm border',
                skill.verificationStatus === '要検証' ? 'border-yellow-200' : 'border-gray-100')}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-bold text-gray-900">{skill.name}</div>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded border shrink-0', verificationColor(skill.verificationStatus))}>
                    {verificationEmoji(skill.verificationStatus)} {skill.verificationStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{skill.description}</p>
                <div className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">発動:</span> {skill.activationCondition}
                </div>
                {(skill.effectType || skill.targetTeam) && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {skill.effectType && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{skill.effectType}</span>
                    )}
                    {skill.targetTeam && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🏷️ {skill.targetTeam}</span>
                    )}
                    {skill.targetAttribute && (
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', attributeColor(skill.targetAttribute))}>
                        {attributeEmoji(skill.targetAttribute)} {skill.targetAttribute}
                      </span>
                    )}
                    {skill.targetPosition && (
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', positionColor(skill.targetPosition))}>
                        {skill.targetPosition}
                      </span>
                    )}
                  </div>
                )}
                {chars.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                    {chars.map(c => (
                      <Link key={c.id} href={`/characters/${c.id}`}
                        className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 px-2 py-0.5 rounded transition-colors">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
