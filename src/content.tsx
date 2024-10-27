// content.tsx

import { openDB } from "idb"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Handle messages directly in the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "listDatabases") {
    indexedDB
      .databases()
      .then((databases) => {
        const dbNames = databases
          .map((db) => db.name)
          .filter(Boolean) as string[]
        sendResponse({ databases: dbNames })
      })
      .catch((error) => {
        sendResponse({ error: error.message })
      })
    return true
  } else if (message.action === "exportDatabase") {
    exportDatabase(message.dbName)
      .then((json) => {
        sendResponse({ json })
      })
      .catch((error) => {
        sendResponse({ error: error.message })
      })
    return true
  } else if (message.action === "importDatabase") {
    importDatabase(message.dbName, message.jsonData)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ error: error.message })
      })
    return true
  }
})

// IndexedDB operations in the background script

const exportDatabase = async (dbName: string): Promise<string> => {
  const db = await openDB(dbName)
  const data: {
    [storeName: string]: {
      keyPath: IDBObjectStore["keyPath"]
      autoIncrement: boolean
      indexes: {
        name: string
        keyPath: IDBIndex["keyPath"]
        unique: boolean
        multiEntry: boolean
      }[]
      data: any[]
    }
  } = {}

  const tx = db.transaction(db.objectStoreNames, "readonly")

  for (const storeName of db.objectStoreNames) {
    const store = tx.objectStore(storeName)
    const items = await store.getAll()
    const keyPath = store.keyPath
    const autoIncrement = store.autoIncrement
    const indexes = Array.from(store.indexNames).map((indexName) => {
      const index = store.index(indexName)
      return {
        name: index.name,
        keyPath: index.keyPath,
        unique: index.unique,
        multiEntry: index.multiEntry
      }
    })
    data[storeName] = {
      keyPath,
      autoIncrement,
      indexes,
      data: items
    }
  }
  db.close()
  return JSON.stringify(data)
}

const importDatabase = async (dbName: string, jsonData: string) => {
  const data: {
    [storeName: string]: {
      keyPath: IDBObjectStore["keyPath"]
      autoIncrement: boolean
      indexes: {
        name: string
        keyPath: IDBIndex["keyPath"]
        unique: boolean
        multiEntry: boolean
      }[]
      data: any[]
    }
  } = JSON.parse(jsonData)
  await indexedDB.deleteDatabase(dbName)
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      for (const storeName in data) {
        const { keyPath, autoIncrement, indexes } = data[storeName]
        const objectStore = db.createObjectStore(storeName, {
          keyPath,
          autoIncrement
        })
        for (const index of indexes) {
          objectStore.createIndex(index.name, index.keyPath, {
            unique: index.unique,
            multiEntry: index.multiEntry
          })
        }
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
