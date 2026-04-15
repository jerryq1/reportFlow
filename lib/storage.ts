import type { HistoryRecord } from './types'

const TEMPLATE_KEY = 'reportflow_template'
const HISTORY_KEY = 'reportflow_history'
const API_KEY_STORAGE = 'reportflow_apikey'
const MAX_HISTORY = 20

export const storage = {
  getTemplate(): string {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(TEMPLATE_KEY) ?? ''
  },
  saveTemplate(value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TEMPLATE_KEY, value)
  },
  clearTemplate(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TEMPLATE_KEY)
  },

  getApiKey(): string {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(API_KEY_STORAGE) ?? ''
  },
  saveApiKey(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(API_KEY_STORAGE, key)
  },

  getHistory(): HistoryRecord[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    } catch {
      return []
    }
  },
  addHistory(record: HistoryRecord): void {
    if (typeof window === 'undefined') return
    const list = storage.getHistory()
    list.unshift(record)
    if (list.length > MAX_HISTORY) list.pop()
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  },
  clearHistory(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(HISTORY_KEY)
  },
}
