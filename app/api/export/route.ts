export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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

const CLIENTES_MADRES = ['PRIMACARNE', 'MARCIAL', 'BARTRA']
const CLIENTES_TOSTONES = ['BOPEPOR']

function getSheetName(row: any): string {
  if (row.tipo_destino === 'granja') return 'Movimientos Internos'
  const c = (row.cliente || '').toUpperCase().trim()
  if (CLIENTES_MADRES.includes(c)) return 'Madres'
  if (CLIENTES_TOSTONES.includes(c)) return 'Tostones_Saldos'
  return 'Engorde'
}

const COLUMNS = [
  { header: 'Semana', key: 'semana', width: 10 },
  { header: 'Fecha', key: 'fecha', width: 12 },
  { header: 'Nº Interno', key: 'numeroInterno', width: 14 },
  { header: 'Granja', key: 'granja', width: 30 },
  { header: 'Crianza', key: 'crianza', width: 10 },
  { header: 'Matadero', key: 'matadero', width: 20 },
  { header: 'Cliente', key: 'cliente', width: 20 },
  { header: 'Nº Animales', key: 'animales', width: 14 },
  { header: 'Peso Neto', key: 'pesoNeto', width: 12 },
  { header: 'Peso Medio', key: 'pesoMedio', width: 12 },
  { header: 'Observaciones', key: 'observaciones', width: 25 },
  { header: 'Cargador', key: 'cargador', width: 15 },
  { header: 'Chófer', key: 'chofer', width: 15 },
  { header: 'Importe Base', key: 'importeBase', width: 14 },
  { header: 'Importe IVA', key: 'importeIva', width: 14 },
  { header: 'Tasa Veterinaria', key: 'tasaVeterinaria', width: 18 },
  { header: 'Tasa Interporc', key: 'tasaInterporc', width: 16 },
  { header: 'Foto 1', key: 'foto1', width: 40 },
  { header: 'Foto 2', key: 'foto2', width: 40 },
  { header: 'Foto 3', key: 'foto3', width: 40 },
  { header: 'Foto 4', key: 'foto4', width: 40 },
]

const COLUMNS_INTERNOS = [
  { header: 'Semana', key: 'semana', width: 10 },
  { header: 'Fecha', key: 'fecha', width: 12 },
  { header: 'Nº Interno', key: 'numeroInterno', width: 14 },
  { header: 'Granja Origen', key: 'granja', width: 30 },
  { header: 'Crianza', key: 'crianza', width: 10 },
  { header: 'Granja Destino', key: 'matadero', width: 30 },
  { header: 'REGA Destino', key: 'cliente', width: 20 },
  { header: 'Nº Animales', key: 'animales', width: 14 },
  { header: 'Peso Neto', key: 'pesoNeto', width: 12 },
  { header: 'Peso Medio', key: 'pesoMedio', width: 12 },
  { header: 'Observaciones', key: 'observaciones', width: 25 },
  { header: 'Cargador', key: 'cargador', width: 15 },
  { header: 'Chófer', key: 'chofer', width: 15 },
  { header: 'Importe Base', key: 'importeBase', width: 14 },
  { header: 'Importe IVA', key: 'importeIva', width: 14 },
  { header: 'Tasa Veterinaria', key: 'tasaVeterinaria', width: 18 },
  { header: 'Tasa Interporc', key: 'tasaInterporc', width: 16 },
  { header: 'Foto 1', key: 'foto1', width: 40 },
  { header: 'Foto 2', key: 'foto2', width: 40 },
  { header: 'Foto 3', key: 'foto3', width: 40 },
  { header: 'Foto 4', key: 'foto4', width: 40 },
]

function setupSheet(sheet: any, columns: any[] = COLUMNS) {
  sheet.columns = columns.map(c => ({ ...c }))
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCC0000' } }
  headerRow.alignment = { horizontal: 'center' }
}

function addRowToSheet(sheet: any, row: any) {
  const fecha = row.fecha ? new Date(row.fecha) : new Date()
  const newRow = sheet.addRow({
    semana: getWeekNumber(fecha),
    fecha: row.fecha,
    numeroInterno: row.numero_albaran_interno || '',
    granja: row.granja,
    crianza: row.crianza || '',
    matadero: row.cliente_matadero,
    cliente: row.cliente || '',
    animales: row.cerdos ? Number(row.cerdos) : '',
    pesoNeto: row.neto ? Number(row.neto) : '',
    pesoMedio: row.media ? Number(row.media) : '',
    observaciones: row.observaciones || '',
    cargador: row.cargador,
    chofer: row.chofer_nombre,
    importeBase: '',
    importeIva: '',
    tasaVeterinaria: '',
    tasaInterporc: '',
    foto1: row.foto_url || '',
    foto2: row.foto_url_2 || '',
    foto3: row.foto_url_3 || '',
    foto4: row.foto_url_4 || '',
  })
  const fotoFields = [
    { key: 'foto1', url: row.foto_url },
    { key: 'foto2', url: row.foto_url_2 },
    { key: 'foto3', url: row.foto_url_3 },
    { key: 'foto4', url: row.foto_url_4 },
  ]
  for (const f of fotoFields) {
    if (f.url) {
      const cell = newRow.getCell(f.key)
      cell.value = { text: 'Ver foto', hyperlink: f.url } as any
      cell.font = { color: { argb: 'FF0066CC' }, underline: true }
    }
  }
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

  const sheets: Record<string, any> = {}
  const sheetNames = ['Engorde', 'Madres', 'Tostones_Saldos', 'Movimientos Internos']
  for (const name of sheetNames) {
    sheets[name] = workbook.addWorksheet(name)
    setupSheet(sheets[name], name === 'Movimientos Internos' ? COLUMNS_INTERNOS : COLUMNS)
  }

  for (const row of rows) {
    const sheetName = getSheetName(row)
    addRowToSheet(sheets[sheetName], row)
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=albaranes.xlsx',
      'X-SharePoint-Error': sharepointError || '',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
