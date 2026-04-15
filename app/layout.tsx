import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReportFlow — AI 日报周报生成器',
  description: '智能职场报告生成工具，输入工作要点，AI 自动润色生成专业日报/周报，支持多种风格和一键导出。',
  keywords: '日报,周报,AI生成,工作报告,职场工具,DeepSeek',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
