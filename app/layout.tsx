import type { Metadata } from 'next'
import '../styles/globals.scss'

export const metadata: Metadata = {
  title: 'Hachlamti',
  description: 'A content-driven platform for recovery stories and therapist connections',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

