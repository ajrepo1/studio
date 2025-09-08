chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizePage",
    title: "Summarize with Summarist",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizePage" && tab?.url) {
    // This will need to be updated to your app's deployed URL
    const appUrl = "http://localhost:9002"; 
    const summarizeUrl = `${appUrl}?url=${encodeURIComponent(tab.url)}`;
    chrome.tabs.create({ url: summarizeUrl });
  }
});

chrome.action.onClicked.addListener((tab) => {
    if (tab?.url) {
        // This will need to be updated to your app's deployed URL
        const appUrl = "http://localhost:9002";
        const summarizeUrl = `${appUrl}?url=${encodeURIComponent(tab.url)}`;
        chrome.tabs.create({ url: summarizeUrl });
    }
});
