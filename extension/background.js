
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizePage",
    title: "Summarize with Summarist",
    contexts: ["page"],
  });
});

function openSummarizerTab(tab) {
  const summarizerUrl = `http://localhost:9002/?url=${encodeURIComponent(tab.url)}`;
  chrome.tabs.create({ url: summarizerUrl });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizePage" && tab) {
    openSummarizerTab(tab);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab) {
    openSummarizerTab(tab);
  }
});
