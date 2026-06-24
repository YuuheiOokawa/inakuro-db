'use client'

import Link from 'next/link'
import { Zap, Sparkles, Package, Trophy, Settings, BarChart2, UserCheck, Layers, CheckCircle, AlertCircle } from 'lucide-react'
import { useUserData } from '@/src/lib/user-data-store'
import { calculateUserSoulShortages } from '@/src/lib/user-completion-calculator'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/user-characters', label: '所持キャラ', icon: UserCheck, color: 'bg-blue-500', desc: '所持・覚醒ランク・魂数を管理' },
  { href: '/user-materials', label: '素材管理', icon: Layers, color: 'bg-teal-500', desc: '属性のかけら在庫を管理' },
  { href: '/materials', label: '素材一覧', icon: Package, color: 'bg-green-500', desc: '所持数・不足数を確認' },
  { href: '/awakening', label: '覚醒素材計算', icon: Zap, color: 'bg-yellow-500', desc: '必要素材を自動計算' },
  { href: '/completion-analysis', label: '完成分析', icon: BarChart2, color: 'bg-indigo-500', desc: '全体の不足を分析' },
  { href: '/skills', label: 'パッシブスキル', icon: Sparkles, color: 'bg-purple-500', desc: 'スキル一覧' },
  { href: '/progress', label: '進捗', icon: Trophy, color: 'bg-orange-500', desc: '覚醒進捗を確認' },
  { href: '/admin', label: '管理画面', icon: Settings, color: 'bg-slate-500', desc: 'データ管理' },
]

export default function HomePage() {
  const { characters } = useUserData()

  const ownedChars = characters.filter(c => c.isOwned)
  const completedChars = characters.filter(c => c.currentAwakeningRank === 'legendary player+')
  const totalChars = characters.length

  const soulShortages = useMemo(() => calculateUserSoulShortages(characters), [characters])
  const totalSoulShortage = soulShortages.reduce((s, r) => s + r.shortage, 0)
  const completePct = totalChars > 0 ? Math.round((completedChars.length / totalChars) * 100) : 0

  const inProgressChars = ownedChars
    .filter(c => c.currentAwakeningRank !== 'legendary player+' && c.currentAwakeningRank !== '未所持')
    .slice(0, 5)

  const topShortages = soulShortages.slice(0, 5)

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-5 lg:p-8 mb-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <h1 className="text-xl lg:text-2xl font-bold">イナクロ育成DB</h1>
        </div>
        <p className="text-blue-200 text-sm">イナズマイレブンクロス 育成データベース</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          label="所持キャラ"
          value={ownedChars.length}
          unit={`/ ${totalChars}体`}
          icon={<UserCheck size={18} />}
          color="bg-blue-500"
        />
        <StatCard
          label="LP+完成"
          value={completedChars.length}
          unit={`/ ${ownedChars.length}体`}
          icon={<CheckCircle size={18} />}
          color={completedChars.length === ownedChars.length && ownedChars.length > 0 ? 'bg-green-500' : 'bg-gray-400'}
        />
        <StatCard
          label="覚醒魂不足"
          value={totalSoulShortage}
          unit="個"
          icon={<AlertCircle size={18} />}
          color={totalSoulShortage > 0 ? 'bg-orange-500' : 'bg-green-500'}
        />
        <StatCard
          label="完成率"
          value={completePct}
          unit="%"
          icon={<Trophy size={18} />}
          color="bg-indigo-500"
        />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">LP+達成率</span>
          <span className="text-sm font-bold text-blue-600">{completePct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-400 h-2.5 rounded-full transition-all"
            style={{ width: `${completePct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>完了 {completedChars.length}体</span>
          <span>未完了 {ownedChars.length - completedChars.length}体</span>
        </div>
      </div>

      {/* Quick menu */}
      <h2 className="text-base font-bold text-gray-700 mb-3">メニュー</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl p-3.5 shadow-sm active:bg-gray-50 flex items-center gap-3"
          >
            <div className={cn(item.color, 'text-white rounded-lg p-2 shrink-0')}>
              <item.icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
              <div className="text-xs text-gray-400 truncate">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom info */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* 育成中キャラ */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
            <AlertCircle size={15} className="text-orange-500" />
            育成中キャラ（LP+未達成）
          </h3>
          {inProgressChars.length === 0 ? (
            <p className="text-sm text-gray-400">全員 LP+ 達成済みです！</p>
          ) : (
            <div className="space-y-2">
              {inProgressChars.map(c => (
                <div key={c.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-800">{c.characterName}</span>
                  <span className="text-xs text-gray-500">{c.currentAwakeningRank}</span>
                </div>
              ))}
              {ownedChars.filter(c => c.currentAwakeningRank !== 'legendary player+' && c.currentAwakeningRank !== '未所持').length > 5 && (
                <p className="text-xs text-gray-400 text-right">...他</p>
              )}
            </div>
          )}
        </div>

        {/* 覚醒魂不足 TOP */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
            <Zap size={15} className="text-yellow-500" />
            覚醒魂不足 TOP5
          </h3>
          {topShortages.length === 0 ? (
            <p className="text-sm text-gray-400">覚醒魂は全員充足しています！</p>
          ) : (
            <div className="space-y-2">
              {topShortages.map(s => (
                <div key={s.characterId} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-800 truncate mr-2">{s.characterName}</span>
                  <span className="text-xs font-bold text-red-600 shrink-0">不足 {s.shortage}個</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, unit, icon, color,
}: {
  label: string; value: number; unit: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <div className={cn(color, 'text-white rounded-lg p-1.5')}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  )
}
