import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './Providers'
import SessionGuard from '@/components/SessionGuard'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RFF Registration',
  description: 'Unlocking The Future Of Real Estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <SessionGuard>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
              </div>
            </SessionGuard>
          </Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
