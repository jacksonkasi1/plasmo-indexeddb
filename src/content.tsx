// content.tsx
import { openDB } from "idb"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const messageHandler = async (message) => {
  try {
    if (message.action === "listDatabases") {
      const databases = await indexedDB.databases()
      const dbNames = databases.map((db) => db.name).filter(Boolean)
      return { databases: dbNames }
    } else if (message.action === "exportDatabase") {
      const json = await exportDatabase(message.dbName)
      return { json }
    } else if (message.action === "importDatabase") {
      await importDatabase(message.dbName, message.jsonData)
      return { success: true }
    }
  } catch (error) {
    return { error: error.message }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  messageHandler(message).then(sendResponse)
  return true
})

const exportDatabase = async (dbName: string): Promise<string> => {
  const db = await openDB(dbName)
  const data: { [key: string]: any[] } = {}
  for (const storeName of db.objectStoreNames) {
    const items = await db.getAll(storeName)
    data[storeName] = items
  }
  db.close()
  return JSON.stringify(data)
}

const importDatabase = async (dbName: string, jsonData: string) => {
  const data: { [key: string]: any[] } = JSON.parse(jsonData)
  await indexedDB.deleteDatabase(dbName)
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      for (const storeName in data) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })
      }
    }
  })
  for (const storeName in data) {
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    for (const item of data[storeName]) {
      await store.put(item)
    }
    await tx.done
  }
  db.close()
}
