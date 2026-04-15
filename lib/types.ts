export type ReportMode = 'daily' | 'weekly'

export type ReportStyle = 'concise'

export interface GenerateRequest {
  mode: ReportMode
  style: ReportStyle
  content: string
  template: string
  apiKey: string
  profession?: string
}

export interface HistoryRecord {
  id: string
  mode: ReportMode
  style: ReportStyle
  content: string
  result: string
  createdAt: string
  profession?: string
}

export const MODE_LABELS: Record<ReportMode, string> = {
  daily: '日报',
  weekly: '周报',
}
