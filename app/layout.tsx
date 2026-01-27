import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DEMO - TASKFLOW',
  description: 'A clean, modern todo app for teams to track their work.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
