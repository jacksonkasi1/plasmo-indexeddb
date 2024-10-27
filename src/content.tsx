// content.tsx

import type { PlasmoCSConfig } from "plasmo"

import { exportDatabase, importDatabase } from "./utils/idb"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

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
      .catch((error) => sendResponse({ error: error.message }))
    return true
  } else if (message.action === "exportDatabase") {
    exportDatabase(message.dbName)
      .then((json) => sendResponse({ json }))
      .catch((error) => sendResponse({ error: error.message }))
    return true
  } else if (message.action === "importDatabase") {
    importDatabase(message.dbName, message.jsonData)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ error: error.message }))
    return true
  }
})
