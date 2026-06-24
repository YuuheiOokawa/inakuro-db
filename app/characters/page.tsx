'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Heart, CheckCircle, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { attributeColor, attributeEmoji, attributeBg, rarityColor, positionColor, verificationColor, verificationEmoji, awakeningRankShort, cn } from '@/lib/utils'
import { isMaxAwakening } from '@/src/lib/awakening-calculator'
import { POSITIONS, ATTRIBUTES, RARITIES } from '@/src/data/inazuma-cross-master'
import type { Position, Attribute, Rarity, VerificationStatus } from '@/lib/types'

const VERIFICATION_STATUSES: VerificationStatus[] = ['公式確認済み', '非公式確認済み', '要検証', '不明']

function CharactersPageInner() {
  const { characters, toggleOwned, toggleFavorite } = useApp()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [filterPos, setFilterPos] = useState<Position | ''>('')
  const [filterAttr, setFilterAttr] = useState<Attribute | ''>('')
  const [filterRarity, setFilterRarity] = useState<Rarity | ''>('')
  const [filterOwned, setFilterOwned] = useState(false)
  const [filterFavorite, setFilterFavorite] = useState(false)
  const [filterVerification, setFilterVerification] = useState<VerificationStatus | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)
  }, [searchParams])

  const filtered = useMemo(() => {
    return characters.filter(c => {
      if (query && !c.name.includes(query) && !(c.team ?? '').includes(query)) return false
      if (filterPos && c.position !== filterPos) return false
      if (filterAttr && c.attribute !== filterAttr) return false
      if (filterRarity && c.rarity !== filterRarity) return false
      if (filterOwned && !c.isOwned) return false
      if (filterFavorite && !c.isFavorite) return false
      if (filterVerification && c.verificationStatus !== filterVerification) return false
      return true
    })
  }, [characters, query, filterPos, filterAttr, filterRarity, filterOwned, filterFavorite, filterVerification])

  const activeCount = [filterPos, filterAttr, filterRarity, filterVerification,
    filterOwned ? 'x' : '', filterFavorite ? 'x' : ''].filter(Boolean).length

  const clearFilters = () => {
    setFilterPos(''); setFilterAttr(''); setFilterRarity('')
    setFilterOwned(false); setFilterFavorite(false); setFilterVerification('')
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">キャラクター一覧</h1>
        <span className="text-sm text-gray-500">{filtered.length} / {characters.length} 体</span>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="名前・チームで検索..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border',
            showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200',
          )}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">フィルター</span>
          {activeCount > 0 && (
            <span className="bg-yellow-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-gray-700">フィルター</span>
            {activeCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
                <X size={12} />クリア
              </button>
            )}
          </div>
          <div className="space-y-3">
            <FilterRow label="ポジション">
              {POSITIONS.map(p => (
                <Chip key={p} active={filterPos === p} onClick={() => setFilterPos(prev => prev === p ? '' : p)}
                  className={filterPos === p ? positionColor(p) : ''}>
                  {p}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="属性">
              {ATTRIBUTES.map(a => (
                <Chip key={a} active={filterAttr === a} onClick={() => setFilterAttr(prev => prev === a ? '' : a)}
                  className={filterAttr === a ? attributeColor(a) : ''}>
                  {attributeEmoji(a)} {a}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="レアリティ">
              {RARITIES.map(r => (
                <Chip key={r} active={filterRarity === r} onClick={() => setFilterRarity(prev => prev === r ? '' : r)}
                  className={filterRarity === r ? rarityColor(r) : ''}>
                  {r}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="検証ステータス">
              {VERIFICATION_STATUSES.map(v => (
                <Chip key={v} active={filterVerification === v}
                  onClick={() => setFilterVerification(prev => prev === v ? '' : v)}
                  className={filterVerification === v ? verificationColor(v) : ''}>
                  {verificationEmoji(v)} {v}
                </Chip>
              ))}
            </FilterRow>
            <div className="flex flex-wrap gap-2 pt-1">
              <ToggleChip active={filterOwned} onClick={() => setFilterOwned(v => !v)} label="所持済みのみ" />
              <ToggleChip active={filterFavorite} onClick={() => setFilterFavorite(v => !v)} label="お気に入りのみ" />
            </div>
          </div>
        </div>
      )}

      {/* Character grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-50" />
          <p>条件に一致するキャラが見つかりません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(char => {
            const maxed = isMaxAwakening(char)
            return (
              <div
                key={char.id}
                className={cn(
                  'bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-all hover:shadow-md',
                  maxed && char.isOwned ? 'border-green-300' : char.isOwned ? 'border-blue-200' : 'border-gray-100 opacity-80',
                )}
              >
                {/* Card header */}
                <div className={cn('px-3 py-2 flex items-center justify-between', char.isOwned ? 'bg-blue-50' : 'bg-gray-50')}>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', positionColor(char.position))}>{char.position}</span>
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', rarityColor(char.rarity))}>{char.rarity}</span>
                  </div>
                  <button onClick={() => toggleFavorite(char.id)} className="p-1 hover:scale-110 transition-transform">
                    <Heart size={16} className={char.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
                  </button>
                </div>

                {/* Attribute banner */}
                <div className={cn('w-full h-20 flex items-center justify-center text-4xl', attributeBg(char.attribute))}>
                  <div className="text-center">
                    <div className="text-3xl">{attributeEmoji(char.attribute)}</div>
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full border', attributeColor(char.attribute))}>
                      {char.attribute}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3">
                  <div className="font-bold text-gray-900 text-sm mb-0.5">{char.name}</div>
                  <div className="text-xs text-gray-500 mb-1.5">{char.team ?? ''}</div>

                  {/* Awakening rank */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs text-gray-500">覚醒:</span>
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded',
                      maxed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {awakeningRankShort(char.currentAwakeningRank)}
                    </span>
                    {!maxed && <span className="text-xs text-gray-400">→ {awakeningRankShort(char.maxAwakeningRank)}</span>}
                    {maxed && <CheckCircle size={12} className="text-green-500" />}
                  </div>

                  {/* Verification badge */}
                  <div className="mb-2">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded border', verificationColor(char.verificationStatus))}>
                      {verificationEmoji(char.verificationStatus)} {char.verificationStatus}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleOwned(char.id)}
                      className={cn(
                        'flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors',
                        char.isOwned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      )}
                    >
                      {char.isOwned ? '✓ 所持' : '未所持'}
                    </button>
                    <Link href={`/characters/${char.id}`}
                      className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 font-medium py-1.5 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                      詳細 <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ active, onClick, className, children }: {
  active: boolean; onClick: () => void; className?: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-bold border transition-colors',
        active ? className : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200',
      )}>
      {children}
    </button>
  )
}

function ToggleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200',
      )}>
      {active && <span className="mr-1">✓</span>}{label}
    </button>
  )
}

export default function CharactersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">読み込み中...</div>}>
      <CharactersPageInner />
    </Suspense>
  )
}
