'use client'
import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import styles from './ApiKeyModal.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeyModal({ isOpen, onClose }: Props) {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setKey(storage.getApiKey())
      setSaved(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    storage.saveApiKey(key.trim())
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} glass-card animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>API Key 设置</h2>
          </div>
          <button id="apikey-close" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <p className={styles.desc}>
            填入你的 API Key，信息仅保存在本地浏览器，不会上传到任何服务器。
          </p>

          <div className={styles.steps}>
            <a
              href="/guide"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.stepLink}
            >
              <span className={styles.stepNum}>1</span>
              <span>查看获取 API Key 的参考指南</span>
              <span className={styles.arrow}>→</span>
            </a>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>2</span>
              <span>将 API Key 粘贴到下方输入框并保存</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              id="apikey-input"
              type={visible ? 'text' : 'password'}
              className="input"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={{ paddingRight: '48px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
            />
            <button
              className={styles.visibilityBtn}
              onClick={() => setVisible(v => !v)}
              type="button"
              title={visible ? '隐藏' : '显示'}
            >
              {visible ? '🙈' : '🐵'}
            </button>
          </div>

          <div className={styles.actions}>
            <button id="apikey-cancel" className="btn btn-ghost" onClick={onClose}>取消</button>
            <button
              id="apikey-save"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!key.trim()}
            >
              {saved ? '✓ 已保存' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
