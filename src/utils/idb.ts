// utils/idb.ts

import { openDB, type IDBPDatabase } from "idb"

interface StoreIndex {
  name: string
  keyPath: string | string[]
  unique: boolean
  multiEntry: boolean
}

interface StoreData {
  keyPath: IDBObjectStore["keyPath"]
  autoIncrement: boolean
  indexes: StoreIndex[]
  data: unknown[]
}

type DatabaseData = Record<string, StoreData>

export const exportDatabase = async (dbName: string): Promise<string> => {
  try {
    const db: IDBPDatabase | undefined = await openDB(dbName)
    if (!db) throw new Error("Database could not be opened.")

    const data: DatabaseData = {}
    const tx = db.transaction(db.objectStoreNames, "readonly")

    for (const storeName of db.objectStoreNames) {
      const store = tx.objectStore(storeName)
      const items = await store.getAll()
      const indexes: StoreIndex[] = Array.from(store.indexNames).map(
        (indexName) => {
          const index = store.index(indexName)
          return {
            name: index.name,
            keyPath: index.keyPath,
            unique: index.unique,
            multiEntry: index.multiEntry
          }
        }
      )
      data[storeName] = {
        keyPath: store.keyPath,
        autoIncrement: store.autoIncrement,
        indexes,
        data: items
      }
    }

    db.close()
    return JSON.stringify(data)
  } catch (err) {
    console.error("Error exporting database:", err)
    throw new Error("Failed to export database.")
  }
}

export const importDatabase = async (dbName: string, jsonData: string) => {
  try {
    const data: DatabaseData = JSON.parse(jsonData)

    // Delete existing database
    indexedDB.deleteDatabase(dbName)

    // Re-create database with imported structure
    const db = await openDB(dbName, 1, {
      upgrade(db) {
        for (const storeName in data) {
          const { keyPath, autoIncrement, indexes } = data[storeName]
          const objectStore = db.createObjectStore(storeName, {
            keyPath,
            autoIncrement
          })
          indexes.forEach((index) => {
            objectStore.createIndex(index.name, index.keyPath, {
              unique: index.unique,
              multiEntry: index.multiEntry
            })
          })
        }
      }
    })

    // Populate data in the newly created database
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
  } catch (err) {
    console.error("Error importing database:", err)
    throw new Error("Failed to import database.")
  }
}
