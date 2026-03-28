'use client'

import { useState, useEffect } from 'react'
import { GRANJAS, type Granja } from '@/lib/granjas'

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
    clienteMatadero: '',
    hAyuno: '',
    observaciones: '',
    cargador: '',
    granjero: '',
    choferNombre: '',
    choferMatricula: '',
    choferEmpresa: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [albaranes, setAlbaranes] = useState<any[]>([])
  const [showList, setShowList] = useState(false)

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
    setFormData(prev => ({
      ...prev,
      granja: nombre,
      localidad: granja?.localidad || '',
      rega: granja?.rega || '',
      marcaOficial: granja?.marcaOficial || '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/albaranes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      alert('Error al guardar el albarán')
    } finally {
      setSaving(false)
    }
  }

  async function loadAlbaranes() {
    const res = await fetch('/api/albaranes')
    const data = await res.json()
    setAlbaranes(data)
    setShowList(true)
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-t-lg border-2 border-gray-300 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-red-600 font-bold text-2xl">🐷</div>
            <div>
              <h1 className="text-red-700 font-bold text-xl">PREMIER PIGS, S.L.</h1>
              <p className="text-xs text-gray-600">B-02580214</p>
              <p className="text-xs text-gray-600">Ctra. LL-11, km 3</p>
              <p className="text-xs text-gray-600">25221 ELS ALAMÚS (Lleida)</p>
              <p className="text-xs text-gray-600">Tel: 973 98 24 60</p>
              <p className="text-xs text-gray-600">www.premierpigs.com</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">ISO 9001</span>
              <span className="text-xs text-gray-500">OCA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">ALBARÁN:</span>
              <input
                type="text"
                value={formData.numero}
                onChange={e => handleChange('numero', e.target.value)}
                className="border border-gray-400 px-2 py-1 w-28 text-center font-bold text-red-600"
                placeholder="Nº"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border-x-2 border-b-2 border-gray-300 rounded-b-lg">
        {/* Fecha y Horas */}
        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-3 border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">FECHA</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={e => handleChange('fecha', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
            />
          </div>
          <div className="p-3 border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">HORA LLEGADA</label>
            <input
              type="time"
              value={formData.horaLlegada}
              onChange={e => handleChange('horaLlegada', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">HORA SALIDA</label>
            <input
              type="time"
              value={formData.horaSalida}
              onChange={e => handleChange('horaSalida', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
            />
          </div>
        </div>

        {/* Granja y datos */}
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">GRANJA</label>
            <select
              value={formData.granja}
              onChange={e => handleGranjaChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold bg-white"
            >
              <option value="">-- Seleccionar granja --</option>
              {GRANJAS.map(g => (
                <option key={g.nombre} value={g.nombre}>{g.nombre}</option>
              ))}
            </select>
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">MARCA / REGA</label>
            <input
              type="text"
              value={formData.rega}
              readOnly
              className="w-full border border-gray-200 rounded px-2 py-1 text-red-600 font-semibold bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">LOCALIDAD</label>
            <input
              type="text"
              value={formData.localidad}
              readOnly
              className="w-full border border-gray-200 rounded px-2 py-1 text-red-600 font-semibold bg-gray-50"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">NÚM. GUÍA</label>
            <input
              type="text"
              value={formData.numGuia}
              onChange={e => handleChange('numGuia', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
            />
          </div>
        </div>

        {/* Marca Oficial */}
        <div className="border-b border-gray-300 p-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">MARCA OFICIAL</label>
          <input
            type="text"
            value={formData.marcaOficial}
            readOnly
            className="w-full border border-gray-200 rounded px-2 py-1 text-red-600 font-semibold bg-gray-50"
          />
        </div>

        {/* Tabla de cerdos */}
        <div className="border-b border-gray-300">
          <div className="grid grid-cols-7 bg-gray-100 text-xs font-bold text-gray-700 text-center">
            <div className="p-2 border-r border-gray-300">CERDOS</div>
            <div className="p-2 border-r border-gray-300">BRUTO</div>
            <div className="p-2 border-r border-gray-300">TARA</div>
            <div className="p-2 border-r border-gray-300">NETO</div>
            <div className="p-2 border-r border-gray-300">MEDIA</div>
            <div className="p-2 border-r border-gray-300">CLIENTE / MATADERO</div>
            <div className="p-2">H. AYUNO</div>
          </div>
          <div className="grid grid-cols-7 text-center">
            <div className="p-2 border-r border-gray-300">
              <input
                type="number"
                value={formData.cerdos}
                onChange={e => handleChange('cerdos', e.target.value)}
                className="w-full text-center border border-gray-300 rounded px-1 py-1 text-red-600 font-bold"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <input
                type="number"
                value={formData.bruto}
                onChange={e => handleChange('bruto', e.target.value)}
                className="w-full text-center border border-gray-300 rounded px-1 py-1 text-red-600 font-bold"
                placeholder="Kg"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <input
                type="number"
                value={formData.tara}
                onChange={e => handleChange('tara', e.target.value)}
                className="w-full text-center border border-gray-300 rounded px-1 py-1 text-red-600 font-bold"
                placeholder="Kg"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <input
                type="text"
                value={formData.neto}
                readOnly
                className="w-full text-center border border-gray-200 rounded px-1 py-1 text-red-600 font-bold bg-gray-50"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <input
                type="text"
                value={formData.media}
                readOnly
                className="w-full text-center border border-gray-200 rounded px-1 py-1 text-red-600 font-bold bg-gray-50"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <input
                type="text"
                value={formData.clienteMatadero}
                onChange={e => handleChange('clienteMatadero', e.target.value)}
                className="w-full text-center border border-gray-300 rounded px-1 py-1 text-red-600 font-bold"
              />
            </div>
            <div className="p-2">
              <input
                type="text"
                value={formData.hAyuno}
                onChange={e => handleChange('hAyuno', e.target.value)}
                className="w-full text-center border border-gray-300 rounded px-1 py-1 text-red-600 font-bold"
                placeholder="horas"
              />
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
            className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
          />
        </div>

        {/* Cargador y Granjero */}
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-r border-gray-300">
            <label className="block text-xs font-semibold text-gray-600 mb-1">CARGADOR</label>
            <input
              type="text"
              value={formData.cargador}
              onChange={e => handleChange('cargador', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">GRANJERO</label>
            <input
              type="text"
              value={formData.granjero}
              onChange={e => handleChange('granjero', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
            />
          </div>
        </div>

        {/* Conforme Chófer */}
        <div className="p-3 border-b border-gray-300">
          <h3 className="text-xs font-bold text-gray-700 mb-2">CONFORME CHÓFER</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">NOMBRE</label>
              <input
                type="text"
                value={formData.choferNombre}
                onChange={e => handleChange('choferNombre', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">MATRÍCULA</label>
              <input
                type="text"
                value={formData.choferMatricula}
                onChange={e => handleChange('choferMatricula', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">EMPRESA</label>
              <input
                type="text"
                value={formData.choferEmpresa}
                onChange={e => handleChange('choferEmpresa', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-red-600 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="p-4 flex gap-3 no-print">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Albarán'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-6 py-2 rounded font-bold hover:bg-gray-700"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={loadAlbaranes}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
          >
            Ver Albaranes
          </button>
        </div>
      </form>

      {/* Lista de albaranes */}
      {showList && (
        <div className="mt-6 bg-white rounded-lg border-2 border-gray-300 p-4 no-print">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Albaranes Guardados</h2>
            <button onClick={() => setShowList(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          {albaranes.length === 0 ? (
            <p className="text-gray-500">No hay albaranes guardados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Nº</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Granja</th>
                    <th className="p-2">Cerdos</th>
                    <th className="p-2">Neto (Kg)</th>
                    <th className="p-2">Media (Kg)</th>
                    <th className="p-2">Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {albaranes.map((a: any) => (
                    <tr key={a.id} className="border-t border-gray-200">
                      <td className="p-2 font-bold">{a.numero}</td>
                      <td className="p-2">{a.fecha}</td>
                      <td className="p-2">{a.granja}</td>
                      <td className="p-2">{a.cerdos}</td>
                      <td className="p-2">{a.neto}</td>
                      <td className="p-2">{a.media}</td>
                      <td className="p-2">{a.cliente_matadero}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
