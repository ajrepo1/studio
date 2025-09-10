
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizePage",
    title: "Summarize with Summarist",
    contexts: ["page"],
  });
});

async function injectContentScript(tab) {
  if (tab.url.startsWith('chrome://')) {
    console.log('Cannot run on chrome:// pages');
    return;
  }
  
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css'],
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    
  } catch (err) {
    console.error(`failed to execute script: ${err}`);
  }
}


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizePage" && tab?.id) {
    injectContentScript(tab);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab?.id) {
    injectContentScript(tab);
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSummary") {
    const apiUrl = `http://localhost:9002/api/summarize`;
    
    console.log(`Fetching summary from: ${apiUrl}`);

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: request.text }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.details || data.error);
        }
        sendResponse({ summary: data.summary });
      })
      .catch(error => {
        console.error("Failed to fetch summary: ", error);
        sendResponse({ error: `Failed to fetch summary: ${error.message}` });
      });

    return true; 
  }
});
