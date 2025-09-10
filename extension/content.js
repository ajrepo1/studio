
(async () => {
  // Check if the modal already exists and remove it to avoid duplicates
  const existingModal = document.getElementById('summarist-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create the modal container
  const modal = document.createElement('div');
  modal.id = 'summarist-modal';
  modal.innerHTML = `
    <div id="summarist-modal-content">
      <div id="summarist-modal-header">
        <h2>Page Summary</h2>
        <button id="summarist-close-btn">&times;</button>
      </div>
      <div id="summarist-modal-body">
        <p id="summarist-summary-text">Fetching summary...</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Add event listener to close the modal
  document.getElementById('summarist-close-btn').addEventListener('click', () => {
    modal.remove();
  });

  // Function to fetch the summary
  async function getSummary() {
    const pageText = document.body.innerText;
    if (!pageText || pageText.trim().length < 100) {
      document.getElementById('summarist-summary-text').innerText = 'Could not find enough text on this page to summarize.';
      return;
    }

    try {
      const response = await fetch('http://localhost:9002/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: pageText }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }
      
      // Use innerHTML to render the Markdown formatting
      const summaryTextElement = document.getElementById('summarist-summary-text');
      summaryTextElement.innerHTML = data.summary
        .replace(/# Core Message/g, '<strong>Core Message</strong>')
        .replace(/## Key Points/g, '<strong>Key Points</strong>')
        .replace(/## Actionable Tasks/g, '<strong>Actionable Tasks</strong>')
        .replace(/\n/g, '<br />');

    } catch (error) {
      console.error("Summarist Error:", error);
      document.getElementById('summarist-summary-text').innerText = `Failed to fetch summary. ${error.message}`;
    }
  }

  // Fetch the summary immediately
  getSummary();
})();
