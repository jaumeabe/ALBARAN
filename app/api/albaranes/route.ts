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

  const fecha = data.fecha ? data.fecha.split('-').reverse().join('.') : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')

  // Upload up to 4 photos
  const fotoUrls: (string | null)[] = [null, null, null, null]
  const fotos: (string | null)[] = [data.foto1, data.foto2, data.foto3, data.foto4]

  const sanitize = (s: string) => String(s).replace(/[^\w\-]/g, '_')
  const albaranIdent = sanitize(data.numeroAlbaranInterno || data.numero || '')

  for (let i = 0; i < 4; i++) {
    if (fotos[i]) {
      try {
        const ext = fotos[i]!.startsWith('data:image/png') ? 'png' : 'jpg'
        const fileName = `Albaran_${albaranIdent}_${fecha}_${i + 1}.${ext}`
        fotoUrls[i] = await uploadPhotoToSharePoint(fotos[i]!, fileName)
      } catch (err: any) {
        console.error(`Error uploading photo ${i + 1}:`, err)
      }
    }
  }

  const row = await sql`
    INSERT INTO albaranes (
      numero, numero_albaran_interno, fecha, hora_llegada, hora_salida,
      granja, localidad, crianza, rega, marca_oficial, num_guia,
      cerdos, bruto, tara, neto, media,
      cliente_matadero, cliente, h_ayuno,
      observaciones, cargador, granjero,
      chofer_nombre, chofer_matricula, chofer_empresa,
      foto_url, foto_url_2, foto_url_3, foto_url_4,
      tipo_destino
    ) VALUES (
      ${data.numero}, ${data.numeroAlbaranInterno || null}, ${data.fecha}, ${data.horaLlegada}, ${data.horaSalida},
      ${data.granja}, ${data.localidad}, ${data.crianza || null}, ${data.rega}, ${data.marcaOficial}, ${data.numGuia},
      ${data.cerdos || null}, ${data.bruto || null}, ${data.tara || null}, ${data.neto || null}, ${data.media || null},
      ${data.matadero}, ${data.cliente}, ${data.hAyuno},
      ${data.observaciones}, ${data.cargador}, ${data.granjero},
      ${data.choferNombre}, ${data.choferMatricula}, ${data.choferEmpresa},
      ${fotoUrls[0]}, ${fotoUrls[1]}, ${fotoUrls[2]}, ${fotoUrls[3]},
      ${data.tipoDestino || 'matadero'}
    )
    RETURNING *
  `

  return NextResponse.json(row[0], { status: 201 })
}
