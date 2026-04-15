import type { ReportMode } from './types'

function getToday(): string {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function getWeekRange(): string {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  return `${fmt(monday)} ~ ${fmt(sunday)}`
}

export function buildPrompt(
  mode: ReportMode,
  content: string,
  template: string,
  profession?: string
): { system: string; user: string } {
  const dateInfo =
    mode === 'daily'
      ? `今天是 ${getToday()}`
      : `本周时间范围：${getWeekRange()}`

  const reportTypeName = mode === 'daily' ? '日报' : '周报'
  const professionInfo = profession ? `\n- 职业：${profession}` : ''

  const templateSection = template.trim()
    ? `\n\n## 参考风格模板\n以下是用户提供的历史${reportTypeName}示例，请学习其写作风格、格式习惯和表达方式，在生成新报告时保持一致的风格：\n\`\`\`\n${template.trim()}\n\`\`\``
    : ''

  const system = `你是一位专业的职场写作助手，擅长将零散的工作要点润色成专业、规范的${reportTypeName}。

你的工作原则：
1. 保留用户提供的所有工作内容，不能遗漏任何要点
2. 润色并补充细节，使语言更专业流畅
3. 对工作内容进行合理的归类和逻辑梳理
4. 保持真实性，不编造不存在的工作内容
5. 输出格式使用 Markdown，标题使用 ## 二级标题
6. 生成简洁版报告：总字数控制在 200~350 字，条目清晰，语言精炼
7. 标准结构：今日/本周完成工作 → 成果亮点 → 问题（如有）→ 下阶段计划${templateSection}`

  const user = `请根据以下工作要点，生成一份专业的${reportTypeName}。

## 基本信息
- 报告类型：${reportTypeName}
- ${dateInfo}${professionInfo}

## 工作内容要点（请根据这些要点生成完整报告）
${content.trim()}

请直接输出报告正文，不需要任何前缀说明。`

  return { system, user }
}
