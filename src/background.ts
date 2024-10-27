// background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (["listDatabases", "exportDatabase", "importDatabase"].includes(message.action)) {
    sendResponse({ fromBackground: true });
    return false;
  }
});