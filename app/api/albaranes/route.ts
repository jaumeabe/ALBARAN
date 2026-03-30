import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { uploadPhotoToSharePoint } from '@/lib/sharepoint'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sql = getDb()

  if (searchParams.get('next') === '1') {
    try {
      const result = await sql`SELECT COALESCE(MAX(id), 0) + 1 AS next_numero FROM albaranes`
      return NextResponse.json({ next: result[0].next_numero })
    } catch {
      return NextResponse.json({ next: 1 })
    }
  }

  const rows = await sql`SELECT * FROM albaranes ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const sql = getDb()

  // Upload photo if provided
  let fotoUrl = ''
  if (data.foto) {
    try {
      const ext = data.foto.startsWith('data:image/png') ? 'png' : 'jpg'
      const fecha = data.fecha ? data.fecha.split('-').reverse().join('.') : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
      const fileName = `Albaran_${data.numero}_${fecha}.${ext}`
      fotoUrl = await uploadPhotoToSharePoint(data.foto, fileName)
    } catch (err: any) {
      console.error('Error uploading photo:', err)
    }
  }

  const row = await sql`
    INSERT INTO albaranes (
      numero, fecha, hora_llegada, hora_salida,
      granja, localidad, rega, marca_oficial, num_guia,
      cerdos, bruto, tara, neto, media,
      cliente_matadero, h_ayuno,
      observaciones, cargador, granjero,
      chofer_nombre, chofer_matricula, chofer_empresa,
      foto_url
    ) VALUES (
      ${data.numero}, ${data.fecha}, ${data.horaLlegada}, ${data.horaSalida},
      ${data.granja}, ${data.localidad}, ${data.rega}, ${data.marcaOficial}, ${data.numGuia},
      ${data.cerdos || null}, ${data.bruto || null}, ${data.tara || null}, ${data.neto || null}, ${data.media || null},
      ${data.clienteMatadero}, ${data.hAyuno},
      ${data.observaciones}, ${data.cargador}, ${data.granjero},
      ${data.choferNombre}, ${data.choferMatricula}, ${data.choferEmpresa},
      ${fotoUrl || null}
    )
    RETURNING *
  `

  return NextResponse.json(row[0], { status: 201 })
}
