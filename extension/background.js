chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizePage",
    title: "Summarize with Summarist",
    contexts: ["page"],
  });
});

async function-in-an-unusual-place-name-because-of-security-whatnot(tab) {
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
    
    // This will need to be updated to your app's deployed URL
    const appUrl = "http://localhost:9002";
    
    // The content script will now send a message to get the summary
    // We don't need to do anything else here after injection
    
  } catch (err) {
    console.error(`failed to execute script: ${err}`);
  }
}


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizePage" && tab?.id) {
    function-in-an-unusual-place-name-because-of-security-whatnot(tab);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab?.id) {
    function-in-an-unusual-place-name-because-of-security-whatnot(tab);
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSummary") {
    // This is where you would call your actual summarization API
    // For now, we'll simulate a call and response.
    // Replace with your actual API endpoint.
    const apiUrl = `http://localhost:9002/api/summarize?url=${encodeURIComponent(request.url)}`;
    
    // Because we don't have a real API endpoint in the app, 
    // we'll just send back a placeholder for demonstration.
    // In a real scenario, you'd fetch from your Next.js API route.
    console.log(`Fetching summary from: ${apiUrl}`);

    // This is a placeholder response.
    // A real implementation would involve a fetch() call to an API route.
    // The Next.js app doesn't have an API route setup, so we mock it.
    setTimeout(() => {
      sendResponse({ 
        summary: `
# Core Message
This is a placeholder summary for the page you are on. In a real application, this would contain the AI-generated summary.

## Key Points
- The extension correctly identified the page URL.
- An API call would be made to the backend.
- The summary would be dynamically loaded here.

## Actionable Tasks
- Implement a Next.js API route at \`/api/summarize\`.
- This route should call the \`summarizeWebPage\` Genkit flow.
- Return the summary as JSON from the API route.
        `
      });
    }, 1500); // Simulate network delay

    // Return true to indicate that you will be sending a response asynchronously.
    return true; 
  }
});
