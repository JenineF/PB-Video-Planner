import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export const metadata = {
  title: 'Personal Branding Video Content Planner',
  description: 'AI-powered monthly video topic generator for digital marketing — by Ring Ring Marketing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-navy-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
