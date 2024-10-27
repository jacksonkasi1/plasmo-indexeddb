// utils/idb.ts

import { openDB } from "idb"

export const exportDatabase = async (dbName: string): Promise<string> => {
  const db = await openDB(dbName)
  const data: Record<string, any> = {}

  const tx = db.transaction(db.objectStoreNames, "readonly")
  for (const storeName of db.objectStoreNames) {
    const store = tx.objectStore(storeName)
    const items = await store.getAll()
    data[storeName] = {
      keyPath: store.keyPath,
      autoIncrement: store.autoIncrement,
      indexes: Array.from(store.indexNames).map((indexName) => {
        const index = store.index(indexName)
        return {
          name: index.name,
          keyPath: index.keyPath,
          unique: index.unique,
          multiEntry: index.multiEntry
        }
      }),
      data: items
    }
  }
  db.close()
  return JSON.stringify(data)
}

export const importDatabase = async (dbName: string, jsonData: string) => {
  const data = JSON.parse(jsonData)
  await indexedDB.deleteDatabase(dbName)
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      for (const storeName in data) {
        const { keyPath, autoIncrement, indexes } = data[storeName]
        const objectStore = db.createObjectStore(storeName, {
          keyPath,
          autoIncrement
        })
        indexes.forEach(({ name, keyPath, unique, multiEntry }: any) => {
          objectStore.createIndex(name, keyPath, { unique, multiEntry })
        })
      }
    }
  })

  for (const storeName in data) {
    const { data: items } = data[storeName]
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    for (const item of items) {
      await store.put(item)
    }
    await tx.done
  }
  db.close()
}
