'use client'
import { useState, useCallback, useEffect } from 'react'
import Switch from '@/components/Switch'
import InputPanel from '@/components/InputPanel'
import PreviewPanel from '@/components/PreviewPanel'
import ApiKeyModal from '@/components/ApiKeyModal'
import HistoryDrawer from '@/components/HistoryDrawer'
import { storage } from '@/lib/storage'
import type { ReportMode, HistoryRecord } from '@/lib/types'
import styles from './page.module.css'

export default function Home() {
  const [mode, setMode] = useState<ReportMode>('daily')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showApiModal, setShowApiModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setHasApiKey(!!storage.getApiKey())
  }, [])

  const handleGenerate = useCallback(async (
    content: string,
    template: string,
    profession: string
  ) => {
    const apiKey = storage.getApiKey()
    if (!apiKey) {
      setShowApiModal(true)
      return
    }

    setIsLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, content, template, apiKey, profession }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error ?? '生成失败，请重试')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (!reader) throw new Error('无法读取响应流')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              fullText += parsed.text
              setResult(fullText)
            }
          } catch {}
        }
      }

      // Save to history
      if (fullText) {
        const record: HistoryRecord = {
          id: Date.now().toString(),
          mode,
          style: 'concise',
          content,
          result: fullText,
          createdAt: new Date().toISOString(),
          profession,
        }
        storage.addHistory(record)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [mode])

  const handleRestore = (record: HistoryRecord) => {
    setResult(record.result)
    setMode(record.mode)
  }

  const handleApiKeySaved = () => {
    setHasApiKey(!!storage.getApiKey())
    setShowApiModal(false)
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>▲</span>
            <span className={styles.logoText}>ReportFlow</span>
          </div>
          <p className={styles.tagline}>AI 驱动的职场报告生成器</p>
        </div>

        <div className={styles.headerCenter}>
          <Switch value={mode} onChange={setMode} />
        </div>

        <div className={styles.headerRight}>
          <button
            id="history-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowHistory(true)}
          >
            历史记录
          </button>
          <button
            id="api-key-btn"
            className={`btn btn-sm ${hasApiKey ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => setShowApiModal(true)}
          >
            {hasApiKey ? '已配置 Key' : '设置 API Key'}
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className={`${styles.errorBanner} animate-fade-in-down`}>
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className={styles.errorClose}>✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Panel */}
        <div className={`${styles.panel} ${styles.leftPanel} glass-card`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              填写工作内容
            </h2>
            <span className="badge badge-purple">
              {mode === 'daily' ? '日报' : '周报'}
            </span>
          </div>
          <InputPanel
            mode={mode}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        {/* Right Panel */}
        <div className={`${styles.panel} ${styles.rightPanel} glass-card`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              AI 生成结果
            </h2>
            {isLoading && (
              <div className={styles.generatingBadge}>
                <span className="animate-spin" style={{ display: 'inline-block' }}>○</span>
                <span>生成中...</span>
              </div>
            )}
          </div>
          <PreviewPanel
            result={result}
            isLoading={isLoading}
            mode={mode}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Powered by</span>
        <a
          href="https://platform.deepseek.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          DeepSeek AI
        </a>
        <span>·</span>
        <span>数据仅存储在本地浏览器</span>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={showApiModal}
        onClose={handleApiKeySaved}
      />
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestore}
      />
    </main>
  )
}
