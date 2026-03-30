export interface MataderoCliente {
  matadero: string
  cliente: string
}

export const MATADEROS_CLIENTES: MataderoCliente[] = [
  { matadero: 'ESFOSA', cliente: 'SUBIRATS' },
  { matadero: 'LITERA MEAT', cliente: 'LITERA MEAT' },
  { matadero: 'FRIBIN', cliente: 'FRIBIN' },
  { matadero: 'MAFRIGES', cliente: 'MAFRIGES' },
  { matadero: 'NOEL', cliente: 'NOEL' },
  { matadero: 'FRISELVA', cliente: 'FRISELVA' },
  { matadero: 'PINK PIG', cliente: 'RIVASAM' },
  { matadero: 'LEPORC', cliente: 'RIVASAM' },
  { matadero: 'ZUERA', cliente: 'RIVASAM' },
  { matadero: 'REIXACH', cliente: 'REIXACH' },
  { matadero: 'NORFRISA', cliente: 'BATALLÉ' },
  { matadero: 'NORFRISA', cliente: 'ROCA' },
  { matadero: 'NORFRISA', cliente: 'FRIUSA' },
  { matadero: 'AVINYÓ', cliente: 'LLARG' },
  { matadero: 'MACOBA', cliente: 'LLARG' },
  { matadero: 'OLOT MEATS', cliente: 'NOEL' },
  { matadero: 'OLOT MEATS', cliente: 'ROCA' },
  { matadero: 'PRIMACARNE', cliente: 'PRIMACARNE' },
  { matadero: 'BOPEPORC', cliente: 'BOPEPORC' },
  { matadero: 'BARTRA', cliente: 'BARTRA' },
]

export const MATADEROS = Array.from(new Set(MATADEROS_CLIENTES.map(m => m.matadero)))

export function getClientesByMatadero(matadero: string): string[] {
  return Array.from(new Set(MATADEROS_CLIENTES.filter(m => m.matadero === matadero).map(m => m.cliente)))
}
