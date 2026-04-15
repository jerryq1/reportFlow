'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ReportMode } from '@/lib/types'
import styles from './PreviewPanel.module.css'

interface Props {
  result: string
  isLoading: boolean
  mode: ReportMode
}

export default function PreviewPanel({ result, isLoading, mode }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [copied, setCopied] = useState(false)

  const displayText = editMode ? editValue : result

  const enterEdit = () => {
    setEditValue(result)
    setEditMode(true)
  }

  const handleCopy = async () => {
    const text = displayText
    if (!text) return
    const plain = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/>\s/g, '')
    await navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = (ext: 'md' | 'txt') => {
    const text = displayText
    if (!text) return
    const date = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')
    const modeName = mode === 'daily' ? '日报' : '周报'

    let content = text
    if (ext === 'md') {
      content = `---\ntitle: ${date} ${modeName}\ndate: ${date}\ntype: ${modeName}\n---\n\n${text}`
    } else {
      content = text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/>\s/g, '')
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${date}_${modeName}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Empty state
  if (!isLoading && !result) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>✨</div>
        <h3 className={styles.emptyTitle}>等待生成报告</h3>
        <p className={styles.emptyDesc}>
          在左侧填写工作内容，点击「立即生成」<br />
          AI 将自动润色成专业的{mode === 'daily' ? '日报' : '周报'}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      {result && (
        <div className={`${styles.toolbar} animate-fade-in-down`}>
          <div className={styles.toolbarLeft}>
            <span className="badge badge-purple">
              {mode === 'daily' ? '日报' : '周报'}
            </span>
          </div>
          <div className={styles.toolbarRight}>
            <button
              id="preview-edit-toggle"
              className={`btn btn-ghost btn-sm ${editMode ? styles.editActive : ''}`}
              onClick={() => editMode ? setEditMode(false) : enterEdit()}
            >
              {editMode ? '预览' : '编辑'}
            </button>
            <button
              id="export-md"
              className="btn btn-ghost btn-sm"
              onClick={() => handleExport('md')}
              title="导出为 Markdown"
            >
              导出 .md
            </button>
            <button
              id="export-txt"
              className="btn btn-ghost btn-sm"
              onClick={() => handleExport('txt')}
              title="导出为纯文本"
            >
              导出 .txt
            </button>
            <button
              id="copy-btn"
              className={`btn btn-sm ${copied ? styles.copiedBtn : 'btn-primary'}`}
              onClick={handleCopy}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={styles.content}>
        {isLoading && !result && (
          <div className={styles.skeleton}>
            <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '16px' }} />
            <div className="skeleton" style={{ height: '14px', width: '100%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '14px', width: '95%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '14px', width: '75%', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '18px', width: '45%', marginBottom: '14px' }} />
            <div className="skeleton" style={{ height: '14px', width: '88%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '10px' }} />
          </div>
        )}

        {editMode ? (
          <textarea
            id="preview-editor"
            className={`textarea ${styles.editor}`}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            style={{ minHeight: '400px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
          />
        ) : (
          result && (
            <div className={`markdown-body animate-fade-in ${isLoading ? 'typing-cursor' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          )
        )}
      </div>
    </div>
  )
}
