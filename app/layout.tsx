import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { AppProvider } from '@/lib/store'
import { UserDataProvider } from '@/src/lib/user-data-store'

export const metadata: Metadata = {
  title: 'イナクロ育成DB',
  description: 'イナズマイレブンクロス キャラクター育成・覚醒データベース',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-100 min-h-screen">
        <AppProvider>
          <UserDataProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-auto">
                {children}
              </main>
            </div>
          </UserDataProvider>
        </AppProvider>
      </body>
    </html>
  )
}
