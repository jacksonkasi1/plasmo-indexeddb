// background.ts

chrome.runtime.onMessage.addListener(
  (
    message: { action: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) => {
    if (!message || typeof message.action !== "string") {
      sendResponse({ error: "Invalid message format" })
      return
    }

    if (
      ["listDatabases", "exportDatabase", "importDatabase"].includes(
        message.action
      )
    ) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0 || !tabs[0]?.id) {
          sendResponse({ error: "No active tab found." })
          return
        }

        chrome.tabs.sendMessage(tabs[0].id, message, (result) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message })
          } else {
            sendResponse(result)
          }
        })
      })
      return true
    } else {
      sendResponse({ error: "Unknown action" })
    }
  }
)
