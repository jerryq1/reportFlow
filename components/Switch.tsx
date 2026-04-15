'use client'
import styles from './Switch.module.css'
import type { ReportMode } from '@/lib/types'

interface Props {
  value: ReportMode
  onChange: (v: ReportMode) => void
}

export default function Switch({ value, onChange }: Props) {
  return (
    <div className={styles.container}>
      <button
        id="switch-daily"
        role="radio"
        aria-checked={value === 'daily'}
        className={`${styles.option} ${value === 'daily' ? styles.active : ''}`}
        onClick={() => onChange('daily')}
      >
        <span className={styles.icon}>📅</span>
        日报
      </button>
      <button
        id="switch-weekly"
        role="radio"
        aria-checked={value === 'weekly'}
        className={`${styles.option} ${value === 'weekly' ? styles.active : ''}`}
        onClick={() => onChange('weekly')}
      >
        <span className={styles.icon}>📊</span>
        周报
      </button>
      <div
        className={styles.slider}
        style={{ transform: value === 'weekly' ? 'translateX(100%)' : 'translateX(0)' }}
      />
    </div>
  )
}
