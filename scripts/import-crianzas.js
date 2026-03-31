const ExcelJS = require('exceljs')
const fs = require('fs')

async function main() {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile('Movimientos Crianza.xlsx')
  const ws = wb.worksheets[0]

  const map = {}
  ws.eachRow((row, num) => {
    if (num < 7) return
    const granja = String(row.values[7] || '').trim()
    const crianza = parseInt(row.values[8])
    if (granja && !isNaN(crianza)) {
      if (!map[granja] || crianza > map[granja]) map[granja] = crianza
    }
  })

  const lines = [
    'export const CRIANZAS: Record<string, number> = {',
  ]

  const sorted = Object.entries(map).sort()
  for (const [granja, crianza] of sorted) {
    const nombre = granja.replace(/^GR\d+\s*-\s*/, '').trim()
    lines.push(`  "${nombre}": ${crianza},`)
  }

  lines.push('}')
  lines.push('')
  lines.push('export function getCrianza(granja: string): string {')
  lines.push('  const c = CRIANZAS[granja]')
  lines.push('  return c !== undefined ? String(c) : ""')
  lines.push('}')
  lines.push('')

  fs.writeFileSync('lib/crianzas.ts', lines.join('\n'), 'utf-8')
  console.log(`Generated crianzas.ts with ${sorted.length} farms.`)
}

main()
