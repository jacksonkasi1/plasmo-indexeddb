import { openDB, type DBSchema } from "idb"

// Define your IndexedDB schema
interface MyDBSchema extends DBSchema {
  [dbName: string]: {
    key: string
    value: any
  }
}

// List all available databases
const listDatabases = async () => {
  // Replace with actual logic to get databases
  const databases = await window.indexedDB.databases()
  return databases.map((db) => db.name).filter(Boolean) as string[]
}

// Export the selected database as JSON
const exportDatabase = async (dbName: string) => {
  const db = await openDB<MyDBSchema>(dbName)
  const data = {}
  for (const storeName of db.objectStoreNames) {
    const tx = db.transaction(storeName, "readonly")
    const storeData = await tx.store.getAll()
    data[storeName] = storeData
  }
  db.close()
  return JSON.stringify(data)
}

// Import JSON data into IndexedDB
const importDatabase = async (dbName: string, jsonData: string) => {
  const data = JSON.parse(jsonData)
  const db = await openDB<MyDBSchema>(dbName, 1, {
    upgrade(db) {
      for (const storeName in data) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })
        }
      }
    },
  })

  for (const storeName in data) {
    const tx = db.transaction(storeName, "readwrite")
    for (const item of data[storeName]) {
      await tx.store.put(item)
    }
    await tx.done
  }
  db.close()
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "listDatabases") {
    const databases = await listDatabases()
    sendResponse({ databases })
  } else if (message.action === "exportDatabase") {
    const json = await exportDatabase(message.dbName)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Download the JSON file
    chrome.downloads.download({
      url,
      filename: `${message.dbName}.json`,
      saveAs: true,
    })
    sendResponse({ success: true })
  } else if (message.action === "importDatabase") {
    await importDatabase(message.dbName, message.jsonData)
    sendResponse({ success: true })
  }
  return true // Indicates async response
})
