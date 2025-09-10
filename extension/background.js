
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizePage",
    title: "Summarize with Summarist",
    contexts: ["page"],
  });
});

async function injectContentScript(tab) {
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    console.log('Cannot run on internal chrome pages');
    return;
  }
  
  try {
    // These files are injected into the page and run in its context.
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css'],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    
  } catch (err) {
    console.error(`Failed to inject content script: ${err}`);
  }
}

// When the user clicks the extension icon
chrome.action.onClicked.addListener((tab) => {
  if (tab?.id) {
    injectContentScript(tab);
  }
});

// When the user right-clicks and uses the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizePage" && tab?.id) {
    injectContentScript(tab);
  }
});
