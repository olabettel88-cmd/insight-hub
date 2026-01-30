import React, { Suspense } from "react"
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: 'PKA291 | OSINT Intelligence Platform',
  description: 'Advanced OSINT intelligence gathering and analysis platform',
  generator: 'v0.app',
  keywords: ['OSINT', 'intelligence', 'data analysis', 'investigations'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ec1313',
}

function MaterialSymbols() {
  return (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="heleket" content="f358cc38" />
        <Suspense fallback={null}>
          <MaterialSymbols />
        </Suspense>
      </head>
      <body className={`${spaceGrotesk.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
