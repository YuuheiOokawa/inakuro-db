'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Zap, Sparkles, Package, Trophy, Settings, BarChart2, Menu, X, UserCheck, Layers } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/user-characters', label: '所持キャラ', icon: UserCheck },
  { href: '/user-materials', label: '素材管理', icon: Layers },
  { href: '/materials', label: '素材一覧', icon: Package },
  { href: '/awakening', label: '覚醒計算', icon: Zap },
  { href: '/completion-analysis', label: '完成分析', icon: BarChart2 },
  { href: '/skills', label: 'パッシブスキル', icon: Sparkles },
  { href: '/progress', label: '進捗', icon: Trophy },
  { href: '/admin', label: '管理', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-blue-900 text-white flex items-center justify-between px-4 h-14 shadow-lg">
        <span className="font-bold text-lg tracking-wide">⚡ イナクロ育成DB</span>
        <button onClick={() => setMobileOpen(v => !v)} className="p-1">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-30 h-full w-64 bg-blue-900 text-white flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:h-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-blue-700">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="font-bold text-lg leading-tight">イナクロ育成DB</div>
            <div className="text-xs text-blue-300">イナズマイレブンクロス</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pt-4 pb-6 mt-14 lg:mt-0">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-700 text-white border-r-4 border-yellow-400'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white',
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-4 text-xs text-blue-400 border-t border-blue-700">
          ver 1.0.0 · ローカル版
        </div>
      </aside>
    </>
  )
}
