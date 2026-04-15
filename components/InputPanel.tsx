'use client'
import { useState, useEffect, useRef } from 'react'
import { storage } from '@/lib/storage'
import type { ReportMode } from '@/lib/types'
import styles from './InputPanel.module.css'

interface Props {
  mode: ReportMode
  onGenerate: (content: string, template: string, profession: string) => void
  isLoading: boolean
}

const DAILY_PLACEHOLDER = `例如：
· 完成了用户登录模块的前端开发，联调接口通过
· 修复了3个线上Bug，包括支付页面闪退问题
· 参加了产品周会，评审了新需求原型
· 协助测试同学完成冒烟测试`

const WEEKLY_PLACEHOLDER = `例如：
· 本周完成了支付模块前后端联调，已提测
· 产出《接口设计规范》技术文档
· 处理了用户反馈的5个紧急Bug
· 协助新成员完成了环境搭建和代码review`

const PROFESSIONS = [
  '程序员', '前端工程师', '后端工程师', '全栈工程师', '算法工程师',
  '数据工程师', '数据分析师', '机器学习工程师', '测试工程师', '运维工程师',
  '产品经理', '项目经理', 'UI设计师', 'UX设计师', '交互设计师',
  '运营专员', '市场营销', '品牌运营', '内容运营', '用户运营',
  '销售经理', '客户经理', '商务拓展', '售前工程师',
  '人力资源', '招聘专员', '培训专员', '薪酬福利专员',
  '财务分析师', '会计', '审计', '税务专员',
  '法务专员', '知识产权专员',
  '供应链经理', '采购专员', '物流专员', '仓储管理',
  '行政专员', '秘书', '总助',
  '教师', '培训讲师', '教研员',
  '医生', '护士', '药剂师',
  '律师', '法律顾问',
  '新媒体运营', '视频剪辑', '摄影师',
  '咨询顾问', '管理咨询', '战略分析师',
]

export default function InputPanel({ mode, onGenerate, isLoading }: Props) {
  const [content, setContent] = useState('')
  const [template, setTemplate] = useState('')
  const [templateSaved, setTemplateSaved] = useState(false)
  const [profession, setProfession] = useState('')
  const [professionInput, setProfessionInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(PROFESSIONS)
  const professionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = storage.getTemplate()
    if (saved) {
      setTemplate(saved)
      setTemplateSaved(true)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (professionRef.current && !professionRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleProfessionInput = (val: string) => {
    setProfessionInput(val)
    setProfession(val)
    const filtered = val.trim()
      ? PROFESSIONS.filter(p => p.includes(val.trim()))
      : PROFESSIONS
    setDropdownOptions(filtered)
    setShowDropdown(true)
  }

  const selectProfession = (p: string) => {
    setProfession(p)
    setProfessionInput(p)
    setShowDropdown(false)
  }

  const handleSaveTemplate = () => {
    storage.saveTemplate(template)
    setTemplateSaved(true)
  }

  const handleClearTemplate = () => {
    storage.clearTemplate()
    setTemplate('')
    setTemplateSaved(false)
  }

  const handleGenerate = () => {
    if (!content.trim() || isLoading) return
    onGenerate(content, template, profession)
  }

  const placeholder = mode === 'daily' ? DAILY_PLACEHOLDER : WEEKLY_PLACEHOLDER

  return (
    <div className={styles.container}>
      {/* Profession Selector */}
      <div className={styles.section}>
        <div className="label">职业</div>
        <div className={styles.professionWrapper} ref={professionRef}>
          <input
            id="profession-input"
            className={`input ${styles.professionInput}`}
            type="text"
            placeholder="选择或输入您的职业（如：程序员）"
            value={professionInput}
            onChange={e => handleProfessionInput(e.target.value)}
            onFocus={() => {
              setDropdownOptions(
                professionInput.trim()
                  ? PROFESSIONS.filter(p => p.includes(professionInput.trim()))
                  : PROFESSIONS
              )
              setShowDropdown(true)
            }}
            autoComplete="off"
          />
          {showDropdown && dropdownOptions.length > 0 && (
            <div className={styles.dropdown}>
              {dropdownOptions.map(p => (
                <button
                  key={p}
                  className={`${styles.dropdownItem} ${profession === p ? styles.dropdownItemActive : ''}`}
                  onMouseDown={() => selectProfession(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Input */}
      <div className={styles.section}>
        <div className="label">
          工作内容
          <span className={styles.required}>*</span>
        </div>
        <textarea
          id="content-input"
          className="textarea"
          rows={8}
          placeholder={placeholder}
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ minHeight: '180px' }}
        />
        <div className={styles.charCount}>{content.length} 字</div>
      </div>

      {/* Template Section — always open */}
      <div className={styles.section}>
        <div className="label">
          参考模板
          {templateSaved && (
            <span className="badge badge-green" style={{ marginLeft: '8px' }}>已保存</span>
          )}
        </div>
        <div className={styles.templateBody}>
          <p className={styles.templateHint}>
            粘贴以往的日报/周报示例，AI 将学习你的写作风格
          </p>
          <textarea
            id="template-input"
            className="textarea"
            rows={5}
            placeholder="粘贴你以往的日报/周报示例..."
            value={template}
            onChange={e => { setTemplate(e.target.value); setTemplateSaved(false) }}
            style={{ minHeight: '120px' }}
          />
          <div className={styles.templateActions}>
            <button
              id="template-save"
              className="btn btn-ghost btn-sm"
              onClick={handleSaveTemplate}
              disabled={!template.trim()}
            >
              本地保存
            </button>
            {template && (
              <button
                id="template-clear"
                className="btn btn-danger btn-sm"
                onClick={handleClearTemplate}
              >
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        id="generate-btn"
        className={`btn btn-primary btn-lg ${styles.generateBtn} ${isLoading ? styles.loading : ''}`}
        onClick={handleGenerate}
        disabled={!content.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <span className="animate-spin" style={{ fontSize: '15px', display: 'inline-block' }}>○</span>
            AI 正在生成中...
          </>
        ) : (
          `立即生成${mode === 'daily' ? '日报' : '周报'}`
        )}
      </button>
    </div>
  )
}
