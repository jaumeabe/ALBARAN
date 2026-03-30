'use client'

import { useState, useEffect } from 'react'
import { GRANJAS, type Granja } from '@/lib/granjas'
import { MATADEROS, getClientesByMatadero } from '@/lib/mataderos'

export default function AlbaranForm() {
  const [formData, setFormData] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    horaLlegada: '',
    horaSalida: '',
    granja: '',
    localidad: '',
    rega: '',
    marcaOficial: '',
    numGuia: '',
    cerdos: '',
    bruto: '',
    tara: '',
    neto: '',
    media: '',
    matadero: '',
    cliente: '',
    hAyuno: '',
    observaciones: '',
    cargador: '',
    granjero: '',
    choferNombre: '',
    choferMatricula: '',
    choferEmpresa: '',
  })
  const [foto, setFoto] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoKey, setFotoKey] = useState(0)
  const [granjaFromList, setGranjaFromList] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function loadNextNumero() {
    try {
      const res = await fetch('/api/albaranes?next=1')
      const data = await res.json()
      setFormData(prev => ({ ...prev, numero: String(data.next || 1) }))
    } catch {
      setFormData(prev => ({ ...prev, numero: '1' }))
    }
  }

  useEffect(() => { loadNextNumero() }, [])

  useEffect(() => {
    const bruto = parseFloat(formData.bruto) || 0
    const tara = parseFloat(formData.tara) || 0
    const cerdos = parseInt(formData.cerdos) || 0
    const neto = bruto - tara
    const media = cerdos > 0 ? neto / cerdos : 0
    setFormData(prev => ({
      ...prev,
      neto: neto > 0 ? neto.toFixed(0) : '',
      media: media > 0 ? media.toFixed(1) : '',
    }))
  }, [formData.bruto, formData.tara, formData.cerdos])

  function handleGranjaChange(nombre: string) {
    const granja = GRANJAS.find(g => g.nombre === nombre)
    setGranjaFromList(!!granja)
    setFormData(prev => ({
      ...prev,
      granja: nombre,
      localidad: granja?.localidad || (granja ? prev.localidad : ''),
      rega: granja?.rega || (granja ? prev.rega : ''),
      marcaOficial: granja?.marcaOficial || (granja ? prev.marcaOficial : ''),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const required: { field: string; label: string }[] = [
      { field: 'granja', label: 'Granja' },
      { field: 'numGuia', label: 'Núm. Guía' },
      { field: 'cerdos', label: 'Cerdos' },
      { field: 'bruto', label: 'Bruto' },
      { field: 'tara', label: 'Tara' },
      { field: 'matadero', label: 'Matadero' },
      { field: 'cliente', label: 'Cliente' },
      { field: 'cargador', label: 'Cargador' },
      { field: 'granjero', label: 'Granjero' },
      { field: 'choferNombre', label: 'Nombre Chófer' },
      { field: 'choferMatricula', label: 'Matrícula Chófer' },
      { field: 'choferEmpresa', label: 'Empresa Chófer' },
    ]
    const missing = required.filter(r => !(formData as any)[r.field]?.toString().trim())
    if (!foto) missing.push({ field: 'foto', label: 'Foto' })
    if (missing.length > 0) {
      alert('Campos obligatorios sin rellenar:\n' + missing.map(m => '- ' + m.label).join('\n'))
      return
    }
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/albaranes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, foto }),
      })
      if (res.ok) {
        alert('Albarán enviado correctamente')
        setSaved(true)
        setFormData({
          numero: '', fecha: new Date().toISOString().split('T')[0],
          horaLlegada: '', horaSalida: '', granja: '', localidad: '',
          rega: '', marcaOficial: '', numGuia: '', cerdos: '', bruto: '',
          tara: '', neto: '', media: '', matadero: '', cliente: '', hAyuno: '',
          observaciones: '', cargador: '', granjero: '',
          choferNombre: '', choferMatricula: '', choferEmpresa: '',
        })
        setFoto(null)
        setFotoPreview(null)
        setFotoKey(prev => prev + 1)
        setGranjaFromList(false)
        loadNextNumero()
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      alert('Error al guardar el albarán')
    } finally {
      setSaving(false)
    }
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => setFoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="bg-white rounded-t-lg border-2 border-gray-300 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-red-600 font-bold text-2xl">🐷</div>
            <div>
              <h1 className="text-red-700 font-bold text-lg sm:text-xl">PREMIER PIGS, S.L.</h1>
              <p className="text-xs text-gray-600">B-02580214</p>
              <p className="text-xs text-gray-600">Ctra. LL-11, km 3 · 25221 ELS ALAMÚS (Lleida)</p>
              <p className="text-xs text-gray-600">Tel: 973 98 24 60 · www.premierpigs.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <div className="hidden sm:flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">ISO 9001</span>
              <span className="text-xs text-gray-500">OCA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">ALBARÁN:</span>
              <input
                type="text"
                value={formData.numero}
                readOnly
                className="border border-gray-400 px-2 py-1 w-20 sm:w-28 text-center font-bold text-red-600 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border-x-2 border-b-2 border-gray-300 rounded-b-lg">
        {/* Fecha y Horas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-300">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">FECHA</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={e => handleChange('fecha', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
            />
          </div>
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">HORA CARGA</label>
            <input
              type="time"
              value={formData.horaLlegada}
              onChange={e => handleChange('horaLlegada', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">HORA DESCARGA</label>
            <input
              type="time"
              value={formData.horaSalida}
              onChange={e => handleChange('horaSalida', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
            />
          </div>
        </div>

        {/* Granja y REGA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">GRANJA</label>
            <input
              type="text"
              list="granjas-list"
              value={formData.granja}
              onChange={e => handleGranjaChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold bg-white text-base"
              placeholder="Seleccionar o escribir granja"
            />
            <datalist id="granjas-list">
              {GRANJAS.map(g => <option key={g.codigo} value={g.nombre} />)}
            </datalist>
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">MARCA / REGA</label>
            <input
              type="text"
              value={formData.rega}
              readOnly={granjaFromList}
              onChange={e => handleChange('rega', e.target.value)}
              className={`w-full border rounded px-2 py-2 text-red-600 font-semibold text-base ${granjaFromList ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
            />
          </div>
        </div>

        {/* Localidad y Guía */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">LOCALIDAD</label>
            <input
              type="text"
              value={formData.localidad}
              readOnly={granjaFromList}
              onChange={e => handleChange('localidad', e.target.value)}
              className={`w-full border rounded px-2 py-2 text-red-600 font-semibold text-base ${granjaFromList ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">NÚM. GUÍA</label>
            <input
              type="text"
              value={formData.numGuia}
              onChange={e => handleChange('numGuia', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
            />
          </div>
        </div>

        {/* Marca Oficial */}
        <div className="border-b border-gray-300 p-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">MARCA OFICIAL</label>
          <input
            type="text"
            value={formData.marcaOficial}
            readOnly={granjaFromList}
            onChange={e => handleChange('marcaOficial', e.target.value)}
            className={`w-full border rounded px-2 py-2 text-red-600 font-semibold text-base ${granjaFromList ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
          />
        </div>

        {/* Tabla de cerdos - Mobile: 2 cols, Desktop: tabla completa */}
        <div className="border-b border-gray-300 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CERDOS</label>
              <input
                type="number"
                value={formData.cerdos}
                onChange={e => { if (e.target.value.length <= 3) handleChange('cerdos', e.target.value) }}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-bold text-base text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">BRUTO (Kg)</label>
              <input
                type="number"
                value={formData.bruto}
                onChange={e => { if (e.target.value.length <= 5) handleChange('bruto', e.target.value) }}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-bold text-base text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">TARA (Kg)</label>
              <input
                type="number"
                value={formData.tara}
                onChange={e => { if (e.target.value.length <= 5) handleChange('tara', e.target.value) }}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-bold text-base text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">NETO (Kg)</label>
              <input
                type="text"
                value={formData.neto}
                readOnly
                className="w-full border border-gray-200 rounded px-2 py-2 text-red-600 font-bold bg-gray-50 text-base text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">MEDIA</label>
              <input
                type="text"
                value={formData.media}
                readOnly
                className="w-full border border-gray-200 rounded px-2 py-2 text-red-600 font-bold bg-gray-50 text-base text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">H. AYUNO</label>
              <input
                type="text"
                value={formData.hAyuno}
                onChange={e => handleChange('hAyuno', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-bold text-base text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">MATADERO</label>
              <input
                type="text"
                list="mataderos-list"
                value={formData.matadero}
                onChange={e => {
                  const val = e.target.value
                  handleChange('matadero', val)
                  const clientes = getClientesByMatadero(val)
                  if (clientes.length === 1) {
                    handleChange('cliente', clientes[0])
                  } else if (clientes.length > 1) {
                    handleChange('cliente', '')
                  }
                }}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-bold text-base"
              />
              <datalist id="mataderos-list">
                {MATADEROS.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CLIENTE</label>
              <input
                type="text"
                list="clientes-list"
                value={formData.cliente}
                onChange={e => handleChange('cliente', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-bold text-base"
              />
              <datalist id="clientes-list">
                {getClientesByMatadero(formData.matadero).map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="border-b border-gray-300 p-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">OBSERVACIONES</label>
          <textarea
            value={formData.observaciones}
            onChange={e => handleChange('observaciones', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
          />
        </div>

        {/* Cargador y Granjero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">CARGADOR</label>
            <input
              type="text"
              value={formData.cargador}
              onChange={e => handleChange('cargador', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">GRANJERO</label>
            <input
              type="text"
              value={formData.granjero}
              onChange={e => handleChange('granjero', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
            />
          </div>
        </div>

        {/* Conforme Chófer */}
        <div className="p-3 border-b border-gray-300">
          <h3 className="text-xs font-bold text-gray-700 mb-2">CONFORME CHÓFER</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">NOMBRE</label>
              <input
                type="text"
                value={formData.choferNombre}
                onChange={e => handleChange('choferNombre', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">MATRÍCULA</label>
              <input
                type="text"
                value={formData.choferMatricula}
                onChange={e => handleChange('choferMatricula', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">EMPRESA</label>
              <input
                type="text"
                value={formData.choferEmpresa}
                onChange={e => handleChange('choferEmpresa', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 text-red-600 font-semibold text-base"
              />
            </div>
          </div>
        </div>

        {/* Foto */}
        <div className="border-b border-gray-300 p-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">FOTO</label>
          <input
            key={fotoKey}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFoto}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          {fotoPreview && (
            <div className="mt-2 relative">
              <img src={fotoPreview} alt="Preview" className="max-h-40 rounded border border-gray-300" />
              <button
                type="button"
                onClick={() => { setFoto(null); setFotoPreview(null) }}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="p-3 sm:p-4 grid grid-cols-2 sm:flex gap-2 sm:gap-3 no-print">
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 bg-red-600 text-white px-4 sm:px-6 py-3 rounded font-bold hover:bg-red-700 disabled:opacity-50 text-base"
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Albarán'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-4 py-3 rounded font-bold hover:bg-gray-700 text-sm"
          >
            Imprimir
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={async () => {
              setExporting(true)
              try {
                const res = await fetch('/api/export')
                const spError = res.headers.get('X-SharePoint-Error')
                if (spError) {
                  alert('Excel descargado pero error OneDrive: ' + spError)
                }
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'albaranes.xlsx'
                a.click()
                URL.revokeObjectURL(url)
                if (!spError) {
                  alert('Excel exportado y OneDrive actualizado correctamente')
                }
              } catch {
                alert('Error al exportar')
              } finally {
                setExporting(false)
              }
            }}
            className="bg-green-600 text-white px-4 py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {exporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </form>

    </div>
  )
}
