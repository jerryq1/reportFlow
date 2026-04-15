import { NextRequest } from 'next/server'
import { buildPrompt } from '@/lib/prompts'
import type { GenerateRequest } from '@/lib/types'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { mode, content, template, apiKey, profession } = body

    if (!apiKey?.trim()) {
      return new Response(
        JSON.stringify({ error: '请先设置 DeepSeek-v3.2 API Key' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ error: '请输入工作内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { system, user } = buildPrompt(mode, content, template, profession)

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3.2',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      let errMsg = 'DeepSeek API 调用失败'
      try {
        const errJson = JSON.parse(errText)
        if (errJson?.error?.message) errMsg = errJson.error.message
      } catch { }
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Forward the SSE stream directly to the client
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
                  )
                }
              } catch { }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '服务器内部错误，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
