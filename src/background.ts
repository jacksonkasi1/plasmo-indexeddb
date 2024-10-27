chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (["listDatabases", "exportDatabase", "importDatabase"].includes(message.action)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ error: "No active tab found." })
        return
      }
      chrome.tabs.sendMessage(tabs[0].id!, message, (result) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message })
        } else {
          sendResponse(result)
        }
      })
    })
    return true
  }
})
