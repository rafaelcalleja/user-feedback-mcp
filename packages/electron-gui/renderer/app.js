document.addEventListener('DOMContentLoaded', async () => {
  const promptContainer = document.getElementById('prompt-container');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackInput = document.getElementById('feedback-input');
  const statusMessage = document.getElementById('status-message');

  // Get the prompt from the main process
  try {
    const prompt = await window.api.getPrompt();
    // Convert newlines to <br> tags to preserve line breaks
    promptContainer.innerHTML = formatPromptWithLineBreaks(prompt);
  } catch (error) {
    showError('Failed to load prompt');
    console.error(error);
  }

  // Function to convert newlines to <br> tags
  function formatPromptWithLineBreaks(text) {
    // Replace newline characters with <br> tags
    // Also escape any HTML to prevent XSS attacks
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  // Handle form submission
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const feedback = feedbackInput.value.trim();

    // Validate feedback
    if (!feedback) {
      showError('Please enter your feedback');
      return;
    }

    // Character limit has been removed to allow for unlimited feedback length

    try {
      // Disable form while submitting
      setFormEnabled(false);

      // Submit feedback to main process
      const result = await window.api.submitFeedback(feedback);

      if (result.success) {
        showSuccess('Feedback submitted successfully');

        // Close the window after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        showError(`Failed to submit feedback: ${result.error}`);
        setFormEnabled(true);
      }
    } catch (error) {
      showError('An error occurred while submitting feedback');
      console.error(error);
      setFormEnabled(true);
    }
  });

  // Helper functions
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message error';
  }

  function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message success';
  }

  function setFormEnabled(enabled) {
    feedbackInput.disabled = !enabled;
    feedbackForm.querySelector('button').disabled = !enabled;
  }
});
