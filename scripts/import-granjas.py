import pandas as pd

df = pd.read_excel(r"C:/Users/jaumejr/Documents/GitHub/ALBARAN/GRANJAS CEBO.xlsx")
# Incluir todas las granjas (sin filtrar)

lines = [
    'export interface Granja {',
    '  codigo: string',
    '  nombre: string',
    '  localidad: string',
    '  provincia: string',
    '  tipoGranja: string',
    '  marcaOficial: string',
    '  rega: string',
    '}',
    '',
    'export const GRANJAS: Granja[] = [',
]

for _, row in df.iterrows():
    codigo = str(row['Granja']).strip()
    nombre = str(row['Nombre']).strip().replace('"', '\\"')
    ciudad = str(row['Ciudad']).strip().replace('"', '\\"')
    provincia = str(row['PROVINCIA']).strip().replace('"', '\\"')
    tipo = str(row['Tipo Granja']).strip()
    marca = str(row['Marca Oficial']).strip()
    rega = str(row['No. Registro']).strip()
    lines.append(f'  {{ codigo: "{codigo}", nombre: "{nombre}", localidad: "{ciudad}", provincia: "{provincia}", tipoGranja: "{tipo}", marcaOficial: "{marca}", rega: "{rega}" }},')

lines.append(']')
lines.append('')

with open(r"C:/Users/jaumejr/Documents/GitHub/ALBARAN/lib/granjas.ts", "w", encoding="utf-8") as f:
    f.write('\n'.join(lines))

print(f"Generated granjas.ts with {len(df)} farms.")
