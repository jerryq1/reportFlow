import fs from 'fs'
import path from 'path'
import ClientGuide from './ClientGuide'

export default function GuidePage() {
  const filePath = path.join(process.cwd(), 'public', 'api-guide.md')
  const content = fs.readFileSync(filePath, 'utf8')

  return <ClientGuide content={content} />
}
