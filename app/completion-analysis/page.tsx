'use client'

import { useMemo } from 'react'
import { BarChart2, Zap, Users, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { useUserData } from '@/src/lib/user-data-store'
import {
  calculateUserSoulShortages,
  summarizeUserFragments,
  type UserSoulShortage,
} from '@/src/lib/user-completion-calculator'
import { cn, rarityColor, awakeningRankShort, attributeColor } from '@/lib/utils'

export default function CompletionAnalysisPage() {
  const { characters, materials } = useUserData()

  const ownedChars = characters.filter(c => c.isOwned)

  const soulShortages = useMemo(
    () => calculateUserSoulShortages(characters),
    [characters]
  )

  const fragments = useMemo(
    () => summarizeUserFragments(materials),
    [materials]
  )

  const totalSoulShortage = soulShortages.reduce((s, r) => s + r.shortage, 0)
  const totalPullsNeeded = soulShortages.reduce((s, r) => s + r.pullsNeeded, 0)
  const completedChars = ownedChars.filter(c =>
    c.currentAwakeningRank === 'legendary player+'
  ).length

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <BarChart2 size={24} className="text-blue-500" /> 完成分析
        <span className="text-sm font-normal text-gray-400 ml-1">
          所持キャラ → Legendary+
        </span>
      </h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SummaryCard
          label="所持キャラ数"
          value={ownedChars.length}
          icon={<Users size={16} />}
          color="bg-blue-500"
        />
        <SummaryCard
          label="LP+完成済み"
          value={completedChars}
          icon={<CheckCircle size={16} />}
          color={completedChars === ownedChars.length ? 'bg-green-500' : 'bg-gray-400'}
        />
        <SummaryCard
          label="覚醒魂不足（合計）"
          value={totalSoulShortage}
          icon={<Zap size={16} />}
          color={totalSoulShortage > 0 ? 'bg-orange-500' : 'bg-green-500'}
        />
        <SummaryCard
          label="必要被り回数（合計）"
          value={totalPullsNeeded}
          icon={<AlertCircle size={16} />}
          color={totalPullsNeeded > 0 ? 'bg-purple-500' : 'bg-green-500'}
        />
      </div>

      <div className="space-y-8">
        {/* 1. 覚醒魂不足ランキング */}
        <Section
          title="覚醒魂不足ランキング"
          icon={<Zap size={18} className="text-orange-500" />}
          badge={soulShortages.length > 0 ? `${soulShortages.length}体不足` : undefined}
        >
          {soulShortages.length === 0 ? (
            <AllClear label="覚醒魂はすべて充足しています" />
          ) : (
            <SoulShortageTable shortages={soulShortages} />
          )}
        </Section>

        {/* 2. ガチャ被り必要数 */}
        <Section
          title="ガチャ被り必要数"
          icon={<AlertCircle size={18} className="text-purple-500" />}
          description="覚醒魂1個 = 同キャラ被り1回"
        >
          {soulShortages.length === 0 ? (
            <AllClear label="ガチャ被りは不要です（覚醒魂充足）" />
          ) : (
            <PullNeedsTable shortages={soulShortages} />
          )}
        </Section>

        {/* 3. 属性のかけら在庫 */}
        <Section
          title="属性のかけら在庫"
          icon={<Package size={18} className="text-amber-500" />}
          description="素材管理ページで更新できます"
        >
          <FragmentInventoryTable fragments={fragments} />
        </Section>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <div className={cn(color, 'text-white rounded-lg p-1')}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</div>
    </div>
  )
}

function Section({
  title,
  icon,
  badge,
  description,
  children,
}: {
  title: string
  icon: React.ReactNode
  badge?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          {icon}
          <span>{title}</span>
          {badge && (
            <span className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <span className="text-xs text-gray-400">{description}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function AllClear({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-green-600 text-sm py-2">
      <CheckCircle size={16} /> {label}
    </div>
  )
}

function SoulShortageTable({ shortages }: { shortages: UserSoulShortage[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500">
            <th className="text-left py-2 pr-2 font-semibold w-8">順</th>
            <th className="text-left py-2 pr-2 font-semibold">キャラ</th>
            <th className="text-left py-2 pr-2 font-semibold hidden lg:table-cell">現在</th>
            <th className="text-left py-2 pr-2 font-semibold hidden lg:table-cell">目標</th>
            <th className="text-right py-2 pr-2 font-semibold">必要</th>
            <th className="text-right py-2 pr-2 font-semibold">所持</th>
            <th className="text-right py-2 font-semibold font-bold">不足</th>
          </tr>
        </thead>
        <tbody>
          {shortages.map((entry, idx) => (
            <tr key={entry.characterId} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 pr-2 text-gray-400 font-mono text-xs">{idx + 1}</td>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold', rarityColor(entry.rarity))}>
                    {entry.rarity}
                  </span>
                  <span className="font-medium text-gray-800">{entry.characterName}</span>
                </div>
                {entry.characterVersion && entry.characterVersion !== '★1' && (
                  <div className="text-xs text-gray-400 mt-0.5">{entry.characterVersion}</div>
                )}
              </td>
              <td className="py-2 pr-2 text-xs text-gray-500 hidden lg:table-cell">
                {awakeningRankShort(entry.currentAwakeningRank)}
              </td>
              <td className="py-2 pr-2 text-xs text-gray-500 hidden lg:table-cell">
                {awakeningRankShort(entry.targetAwakeningRank)}
              </td>
              <td className="py-2 pr-2 text-right text-gray-700">{entry.requiredSouls}</td>
              <td className="py-2 pr-2 text-right text-gray-700">{entry.ownedSouls}</td>
              <td className="py-2 text-right font-bold text-red-600">{entry.shortage}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td colSpan={4} className="py-2 pr-2 text-xs text-gray-500 font-semibold">合計</td>
            <td className="py-2 pr-2 text-right font-bold text-gray-700">
              {shortages.reduce((s, r) => s + r.requiredSouls, 0)}
            </td>
            <td className="py-2 pr-2 text-right font-bold text-gray-700">
              {shortages.reduce((s, r) => s + r.ownedSouls, 0)}
            </td>
            <td className="py-2 text-right font-bold text-red-600">
              {shortages.reduce((s, r) => s + r.shortage, 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function PullNeedsTable({ shortages }: { shortages: UserSoulShortage[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500">
            <th className="text-left py-2 pr-2 font-semibold">キャラ名</th>
            <th className="text-left py-2 pr-2 font-semibold hidden lg:table-cell">レアリティ</th>
            <th className="text-left py-2 pr-2 font-semibold hidden lg:table-cell">現在</th>
            <th className="text-left py-2 pr-2 font-semibold hidden lg:table-cell">目標</th>
            <th className="text-right py-2 pr-2 font-semibold">魂不足数</th>
            <th className="text-right py-2 font-semibold font-bold">必要被り回数</th>
          </tr>
        </thead>
        <tbody>
          {shortages.map(need => (
            <tr key={need.characterId} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 pr-2">
                <div className="font-medium text-gray-800">{need.characterName}</div>
                <div className="text-xs text-gray-400">{need.soulName}</div>
              </td>
              <td className="py-2 pr-2 hidden lg:table-cell">
                <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold', rarityColor(need.rarity))}>
                  {need.rarity}
                </span>
              </td>
              <td className="py-2 pr-2 text-xs text-gray-500 hidden lg:table-cell">
                {awakeningRankShort(need.currentAwakeningRank)}
              </td>
              <td className="py-2 pr-2 text-xs text-gray-500 hidden lg:table-cell">
                {awakeningRankShort(need.targetAwakeningRank)}
              </td>
              <td className="py-2 pr-2 text-right text-gray-600">{need.shortage}</td>
              <td className="py-2 text-right">
                <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full text-sm">
                  {need.pullsNeeded}回
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td colSpan={4} className="py-2 pr-2 text-xs text-gray-500 font-semibold">合計</td>
            <td className="py-2 pr-2 text-right font-bold text-gray-700">
              {shortages.reduce((s, n) => s + n.shortage, 0)}
            </td>
            <td className="py-2 text-right font-bold text-purple-600">
              {shortages.reduce((s, n) => s + n.pullsNeeded, 0)}回
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function FragmentInventoryTable({
  fragments,
}: {
  fragments: Array<{ id: string; name: string; attribute: string; ownedCount: number }>
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {fragments.map(f => (
        <div key={f.id} className="border border-gray-100 rounded-lg p-3 text-center">
          <span className={cn(
            'inline-block text-xs font-bold px-2 py-0.5 rounded-full border mb-2',
            attributeColor(f.attribute)
          )}>
            {f.attribute}
          </span>
          <div className="text-lg font-bold text-gray-800">
            {f.ownedCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">個</div>
        </div>
      ))}
    </div>
  )
}
