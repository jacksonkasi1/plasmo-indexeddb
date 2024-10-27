// background.ts

interface Message {
  action: "listDatabases" | "exportDatabase" | "importDatabase"
  dbName?: string
  jsonData?: string
}

interface ResponseData {
  databases?: string[]
  json?: string
  success?: boolean
  error?: string
}

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseData) => void
  ) => {
    if (
      !["listDatabases", "exportDatabase", "importDatabase"].includes(
        message.action
      )
    ) {
      sendResponse({ error: "Unknown action" })
      return
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0 || !tabs[0]?.id) {
        sendResponse({ error: "No active tab found." })
        return
      }

      chrome.tabs.sendMessage(tabs[0].id, message, (result) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message })
        } else {
          sendResponse(result as ResponseData)
        }
      })
    })

    return true // Keeps the messaging channel open for async response
  }
)
