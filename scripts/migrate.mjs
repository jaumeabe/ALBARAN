import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS albaranes (
    id SERIAL PRIMARY KEY,
    numero TEXT,
    fecha TEXT,
    hora_llegada TEXT,
    hora_salida TEXT,
    granja TEXT,
    localidad TEXT,
    rega TEXT,
    marca_oficial TEXT,
    num_guia TEXT,
    cerdos INTEGER,
    bruto NUMERIC,
    tara NUMERIC,
    neto NUMERIC,
    media NUMERIC,
    cliente_matadero TEXT,
    h_ayuno TEXT,
    observaciones TEXT,
    cargador TEXT,
    granjero TEXT,
    chofer_nombre TEXT,
    chofer_matricula TEXT,
    chofer_empresa TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`

await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS foto_url TEXT`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS cliente TEXT`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS foto_url_2 TEXT`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS foto_url_3 TEXT`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS foto_url_4 TEXT`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS tipo_destino TEXT DEFAULT 'matadero'`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS crianza TEXT`
await sql`ALTER TABLE albaranes ADD COLUMN IF NOT EXISTS numero_albaran_interno TEXT`

console.log('Migration completed: albaranes table updated.')
