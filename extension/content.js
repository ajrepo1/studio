// Avoid injecting the script multiple times
if (!document.getElementById('summarist-modal-container')) {

  function createModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'summarist-modal-container';
    document.body.appendChild(modalContainer);

    modalContainer.innerHTML = `
      <div id="summarist-modal-backdrop"></div>
      <div id="summarist-modal">
        <div id="summarist-modal-header">
          <img src="${chrome.runtime.getURL('summarist-icon.svg')}" alt="Summarist Icon" />
          <h2>Page Summary</h2>
          <button id="summarist-close-btn">&times;</button>
        </div>
        <div id="summarist-modal-content">
          <div id="summarist-loader">
            <div class="summarist-spinner"></div>
            <p>Generating summary...</p>
          </div>
          <div id="summarist-summary-display" style="display: none;"></div>
        </div>
      </div>
    `;

    document.getElementById('summarist-close-btn').addEventListener('click', closeModal);
    document.getElementById('summarist-modal-backdrop').addEventListener('click', closeModal);
  }

  function closeModal() {
    const modalContainer = document.getElementById('summarist-modal-container');
    if (modalContainer) {
      modalContainer.remove();
    }
  }

  function showSummary(summaryHtml) {
    const loader = document.getElementById('summarist-loader');
    const summaryDisplay = document.getElementById('summarist-summary-display');
    if (loader) loader.style.display = 'none';
    if (summaryDisplay) {
      summaryDisplay.innerHTML = summaryHtml;
      summaryDisplay.style.display = 'block';
    }
  }
  
  function showError(message) {
     const loader = document.getElementById('summarist-loader');
     const summaryDisplay = document.getElementById('summarist-summary-display');
     if (loader) loader.style.display = 'none';
     if(summaryDisplay) {
        summaryDisplay.innerHTML = `<div class="summarist-error">${message}</div>`;
        summaryDisplay.style.display = 'block';
     }
  }

  createModal();

  const pageText = document.body.innerText;

  chrome.runtime.sendMessage({ action: "getSummary", text: pageText }, (response) => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        showError('An error occurred while communicating with the extension.');
        return;
    }
    if (response && response.summary) {
      // NOTE: In a real app, you would use a library like 'marked' to safely convert Markdown to HTML.
      // For this prototype, we'll do a basic conversion.
      const htmlSummary = response.summary
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\- (.*)/g, '<li>$1</li>')
        .replace(/(\<li\>.*\<\/li\>)/gs, '<ul>$1</ul>');
        
      showSummary(htmlSummary);
    } else if (response && response.error) {
      showError(response.error);
    } else {
       showError('Failed to get summary. The response was empty or malformed.');
    }
  });

}
