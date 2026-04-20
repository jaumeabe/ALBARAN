const DB_NAME = 'albaranes-offline'
const STORE = 'pendientes'
const VERSION = 1

export interface PendingAlbaran {
  id: number
  payload: any
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no disponible'))
      return
    }
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function queueAlbaran(payload: any): Promise<number> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.add({ payload, createdAt: Date.now() })
    req.onsuccess = () => resolve(req.result as number)
    req.onerror = () => reject(req.error)
  })
}

export async function listPending(): Promise<PendingAlbaran[]> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const store = tx.objectStore(STORE)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result as PendingAlbaran[])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

export async function removePending(id: number): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function countPending(): Promise<number> {
  const pending = await listPending()
  return pending.length
}

export async function flushPending(): Promise<{ sent: number; failed: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { sent: 0, failed: 0 }
  }
  const items = await listPending()
  let sent = 0
  let failed = 0
  for (const item of items) {
    try {
      const res = await fetch('/api/albaranes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      })
      if (res.ok) {
        await removePending(item.id)
        sent++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }
  return { sent, failed }
}
