document.addEventListener('DOMContentLoaded', async () => {
  const promptContainer = document.getElementById('prompt-container');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackInput = document.getElementById('feedback-input');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const statusMessage = document.getElementById('status-message');

  // Array to store pasted images
  const pastedImages = [];

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

  // Handle image paste events
  feedbackInput.addEventListener('paste', (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        const reader = new FileReader();

        reader.onload = (e) => {
          const imageData = {
            data: e.target.result.split(',')[1], // Remove the data URL prefix
            mimeType: blob.type
          };

          // Add image to the array
          pastedImages.push(imageData);

          // Create image preview
          addImagePreview(imageData, pastedImages.length - 1);
        };

        reader.readAsDataURL(blob);
      }
    }
  });

  // Function to add image preview
  function addImagePreview(imageData, index) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview';
    previewDiv.dataset.index = index;

    const img = document.createElement('img');
    img.src = `data:${imageData.mimeType};base64,${imageData.data}`;

    const removeButton = document.createElement('div');
    removeButton.className = 'remove-image';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
      // Remove from array
      pastedImages.splice(index, 1);

      // Remove from DOM
      previewDiv.remove();

      // Update indices of remaining previews
      const remainingPreviews = imagePreviewContainer.querySelectorAll('.image-preview');
      remainingPreviews.forEach((preview, i) => {
        preview.dataset.index = i;
      });
    });

    previewDiv.appendChild(img);
    previewDiv.appendChild(removeButton);
    imagePreviewContainer.appendChild(previewDiv);
  }

  // Handle form submission
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const feedback = feedbackInput.value.trim();

    // Validate feedback
    if (!feedback && pastedImages.length === 0) {
      showError('Please enter your feedback or paste at least one image');
      return;
    }

    try {
      // Disable form while submitting
      setFormEnabled(false);

      // Submit feedback to main process
      const result = await window.api.submitFeedback(feedback, pastedImages.length > 0 ? pastedImages : undefined);

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
