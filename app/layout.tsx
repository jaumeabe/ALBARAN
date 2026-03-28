import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Albarán - Premier Pigs, S.L.',
  description: 'Sistema de albaranes Premier Pigs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
