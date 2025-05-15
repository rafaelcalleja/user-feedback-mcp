document.addEventListener('DOMContentLoaded', async () => {
  const promptContainer = document.getElementById('prompt-container');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackInput = document.getElementById('feedback-input');
  const statusMessage = document.getElementById('status-message');
  
  // Get the prompt from the main process
  try {
    const prompt = await window.api.getPrompt();
    promptContainer.textContent = prompt;
  } catch (error) {
    showError('Failed to load prompt');
    console.error(error);
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
    
    if (feedback.length > 10000) {
      showError('Feedback is too long (maximum 10,000 characters)');
      return;
    }
    
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
