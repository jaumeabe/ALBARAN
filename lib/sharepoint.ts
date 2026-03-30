// @ts-ignore
import ExcelJS from 'exceljs'

const TENANT_ID = process.env.MICROSOFT_TENANT_ID!
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!
const USER_EMAIL = 'jaumejr@premierpigs.com'
const FOLDER_PATH = 'Albaranes'
const FILE_NAME = 'albaranes.xlsx'

async function getAccessToken(): Promise<string> {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token error: ${err}`)
  }

  const data = await res.json()
  return data.access_token
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

async function ensureFolder(token: string, path: string): Promise<void> {
  const url = `https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/drive/root:/${path}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

  if (!res.ok) {
    // Create folder - need to create parent first if nested
    const parts = path.split('/')
    let currentPath = ''
    for (const part of parts) {
      const parentPath = currentPath
        ? `https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/drive/root:/${currentPath}:/children`
        : `https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/drive/root/children`

      await fetch(parentPath, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: part,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename',
        }),
      })
      currentPath = currentPath ? `${currentPath}/${part}` : part
    }
  }
}

export async function uploadPhotoToSharePoint(
  photoBase64: string,
  fileName: string
): Promise<string> {
  const token = await getAccessToken()

  const fotosPath = `${FOLDER_PATH}/fotos`
  await ensureFolder(token, fotosPath)

  // Convert base64 to binary
  const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '')
  const binaryData = Buffer.from(base64Data, 'base64')

  const filePath = `${fotosPath}/${fileName}`
  const fileUrl = `https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/drive/root:/${filePath}`

  // Upload photo
  const uploadRes = await fetch(`${fileUrl}:/content`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: binaryData as any,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    throw new Error(`Photo upload error: ${err}`)
  }

  const uploadData = await uploadRes.json()
  const itemId = uploadData.id

  // Create sharing link
  const shareRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/drive/items/${itemId}/createLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'view',
        scope: 'organization',
      }),
    }
  )

  if (shareRes.ok) {
    const shareData = await shareRes.json()
    return shareData.link.webUrl
  }

  // Fallback: return the webUrl from upload
  return uploadData.webUrl || ''
}

export async function uploadAllToSharePoint(rows: any[]): Promise<void> {
  const token = await getAccessToken()

  await ensureFolder(token, FOLDER_PATH)

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

    // Make foto cell a clickable hyperlink
    if (row.foto_url) {
      const fotoCell = newRow.getCell('foto')
      fotoCell.value = { text: 'Ver foto', hyperlink: row.foto_url } as any
      fotoCell.font = { color: { argb: 'FF0066CC' }, underline: true }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const uint8 = new Uint8Array(buffer)

  const filePath = `${FOLDER_PATH}/${FILE_NAME}`
  const fileUrl = `https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/drive/root:/${filePath}`

  const uploadRes = await fetch(`${fileUrl}:/content`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    body: uint8 as any,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    throw new Error(`SharePoint upload error: ${err}`)
  }
}
