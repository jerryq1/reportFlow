'use client'
import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import type { HistoryRecord } from '@/lib/types'
import styles from './HistoryDrawer.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  onRestore: (record: HistoryRecord) => void
}

export default function HistoryDrawer({ isOpen, onClose, onRestore }: Props) {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  // Load when drawer opens
  useEffect(() => {
    if (isOpen) {
      setRecords(storage.getHistory())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClearAll = () => {
    storage.clearHistory()
    setRecords([])
  }

  const styleName = (s: string) =>
    ({ concise: '简洁版', detailed: '详细版', formal: '汇报版' }[s] ?? s)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.drawer} glass-card animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>历史记录</h3>
            <p className={styles.subtitle}>最近 {records.length} 条，最多保留 20 条</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {records.length > 0 && (
              <button id="history-clear-all" className="btn btn-danger btn-sm" onClick={handleClearAll}>
                清空
              </button>
            )}
            <button id="history-close" className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.list}>
          {records.length === 0 ? (
            <div className={styles.empty}>
              <p>还没有历史记录</p>
            </div>
          ) : (
            records.map(rec => (
              <div
                key={rec.id}
                className={`${styles.item} ${expanded === rec.id ? styles.itemExpanded : ''}`}
              >
                <div
                  className={styles.itemHeader}
                  onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                >
                  <div className={styles.itemMeta}>
                    <span className="badge badge-purple">{rec.mode === 'daily' ? '日报' : '周报'}</span>
                    <span className="badge badge-cyan">{styleName(rec.style)}</span>
                    <span className={styles.itemTime}>
                      {new Date(rec.createdAt).toLocaleString('zh-CN', {
                        month: 'numeric', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className={styles.chevron}>{expanded === rec.id ? '▲' : '▼'}</span>
                </div>

                <p className={styles.itemPreview}>
                  {rec.result.replace(/[#*`>\n]/g, ' ').slice(0, 100)}...
                </p>

                {expanded === rec.id && (
                  <div className={`${styles.itemDetail} animate-fade-in`}>
                    <div className={styles.detailContent}>
                      {rec.result.slice(0, 500)}...
                    </div>
                    <button
                      id={`history-restore-${rec.id}`}
                      className="btn btn-primary btn-sm"
                      onClick={() => { onRestore(rec); onClose() }}
                      style={{ alignSelf: 'flex-end', marginTop: '8px' }}
                    >
                      恢复此记录
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
