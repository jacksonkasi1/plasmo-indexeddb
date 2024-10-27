// background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (["listDatabases", "exportDatabase", "importDatabase"].includes(message.action)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ error: "No active tab found." })
        return
      }
      chrome.tabs.sendMessage(tabs[0].id!, message, (response) => {
        sendResponse(response)
      })
    })
    return true // Keep the message port open for async response
  }
})
