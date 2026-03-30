import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
// @ts-ignore
import ExcelJS from 'exceljs'
import { uploadAllToSharePoint } from '@/lib/sharepoint'

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM albaranes ORDER BY id ASC`

  // Upload to OneDrive
  let sharepointError = null
  try {
    await uploadAllToSharePoint(rows)
  } catch (err: any) {
    sharepointError = err?.message || String(err)
    console.error('Error writing to SharePoint:', err)
  }

  // Build Excel for download
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Albaranes')

  sheet.columns = [
    { header: 'Semana', key: 'semana', width: 10 },
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Granja', key: 'granja', width: 30 },
    { header: 'Matadero', key: 'matadero', width: 20 },
    { header: 'Cliente', key: 'cliente', width: 20 },
    { header: 'Nº Animales', key: 'animales', width: 14 },
    { header: 'Peso Neto', key: 'pesoNeto', width: 12 },
    { header: 'Peso Medio', key: 'pesoMedio', width: 12 },
    { header: 'Visitador', key: 'visitador', width: 15 },
    { header: 'Cargador', key: 'cargador', width: 15 },
    { header: 'Chófer', key: 'chofer', width: 15 },
    { header: 'Importe Base', key: 'importeBase', width: 14 },
    { header: 'Importe IVA', key: 'importeIva', width: 14 },
    { header: 'Tasa Veterinaria', key: 'tasaVeterinaria', width: 18 },
    { header: 'Tasa Interporc', key: 'tasaInterporc', width: 16 },
    { header: 'Foto', key: 'foto', width: 40 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCC0000' } }
  headerRow.alignment = { horizontal: 'center' }

  for (const row of rows) {
    const fecha = row.fecha ? new Date(row.fecha) : new Date()
    const newRow = sheet.addRow({
      semana: getWeekNumber(fecha),
      fecha: row.fecha,
      granja: row.granja,
      matadero: row.cliente_matadero,
      cliente: row.cliente_matadero,
      animales: row.cerdos ? Number(row.cerdos) : '',
      pesoNeto: row.neto ? Number(row.neto) : '',
      pesoMedio: row.media ? Number(row.media) : '',
      visitador: '',
      cargador: row.cargador,
      chofer: row.chofer_nombre,
      importeBase: '',
      importeIva: '',
      tasaVeterinaria: '',
      tasaInterporc: '',
      foto: row.foto_url || '',
    })
    if (row.foto_url) {
      const fotoCell = newRow.getCell('foto')
      fotoCell.value = { text: 'Ver foto', hyperlink: row.foto_url } as any
      fotoCell.font = { color: { argb: 'FF0066CC' }, underline: true }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=albaranes.xlsx',
      'X-SharePoint-Error': sharepointError || '',
    },
  })
}
