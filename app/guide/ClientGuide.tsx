'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './guide.module.css'
import Link from 'next/link'

interface Props {
  content: string
}

export default function ClientGuide({ content }: Props) {
  const [zoomImg, setZoomImg] = useState<string | null>(null)

  // Handle background scroll lock
  useEffect(() => {
    if (zoomImg) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [zoomImg])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backBtn} onClick={() => { document.body.style.overflow = '' }}>
            ← 返回首页
          </Link>
          <div className={styles.badge}>文档中心</div>
        </div>
      </header>

      <main className={styles.main}>
        <article className="glass-card animate-fade-in">
          <div className={`${styles.content} markdown-body`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => {
                  const src = typeof props.src === 'string' && props.src.startsWith('http') ? props.src : `/${props.src}`
                  return (
                    <span className={styles.imageWrapper} onClick={() => setZoomImg(src)}>
                      <img 
                        {...props} 
                        src={src}
                        className={styles.zoomableImg}
                        title="点击放大图片"
                      />
                      <span className={styles.zoomHint}>🔍 点击放大</span>
                    </span>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 ReportFlow • 助力更高效的工作汇报</p>
      </footer>

      {/* Zoom Modal - Rendered at root level to avoid parent transforms */}
      {zoomImg && (
        <div className={styles.zoomOverlay} onClick={() => setZoomImg(null)}>
          <div className={styles.zoomContainer} onClick={e => e.stopPropagation()}>
            <img src={zoomImg} className={styles.zoomedImg} alt="Zoomed" />
            <button className={styles.zoomClose} onClick={() => setZoomImg(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
