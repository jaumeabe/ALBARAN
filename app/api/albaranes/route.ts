import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM albaranes ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const sql = getDb()

  const row = await sql`
    INSERT INTO albaranes (
      numero, fecha, hora_llegada, hora_salida,
      granja, localidad, rega, marca_oficial, num_guia,
      cerdos, bruto, tara, neto, media,
      cliente_matadero, h_ayuno,
      observaciones, cargador, granjero,
      chofer_nombre, chofer_matricula, chofer_empresa
    ) VALUES (
      ${data.numero}, ${data.fecha}, ${data.horaLlegada}, ${data.horaSalida},
      ${data.granja}, ${data.localidad}, ${data.rega}, ${data.marcaOficial}, ${data.numGuia},
      ${data.cerdos || null}, ${data.bruto || null}, ${data.tara || null}, ${data.neto || null}, ${data.media || null},
      ${data.clienteMatadero}, ${data.hAyuno},
      ${data.observaciones}, ${data.cargador}, ${data.granjero},
      ${data.choferNombre}, ${data.choferMatricula}, ${data.choferEmpresa}
    )
    RETURNING *
  `

  return NextResponse.json(row[0], { status: 201 })
}
