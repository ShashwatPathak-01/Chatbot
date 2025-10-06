const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = chatForm.querySelector('button[type="submit"]');

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function appendMessage(sender, text, isLoading = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = sender === 'user' ? 'chat-message user' : 'chat-message bot';
  msgDiv.innerHTML = `
    <div class="avatar">
      <img src="${sender === 'user' ? 'https://api.dicebear.com/7.x/identicon/svg?seed=user' : 'https://api.dicebear.com/7.x/bottts/svg?seed=bot'}" alt="${sender}">
    </div>
    <div class="bubble">${isLoading ? '<span class="spinner"></span>' : renderMarkdown(text)}</div>
  `;
  msgDiv.style.opacity = 0;
  chatBox.appendChild(msgDiv);
  setTimeout(() => { msgDiv.style.opacity = 1; }, 50);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show welcome message on load
window.addEventListener('DOMContentLoaded', () => {
  appendMessage('bot', '👋 Welcome! How can I help you today?');
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = userInput.value.trim();
  if (!prompt) return;
  appendMessage('user', prompt);
  userInput.value = '';
  sendButton.disabled = true;
  appendMessage('bot', '', true); // Show spinner
  try {
    const res = await fetch('/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const text = await res.text();
    chatBox.lastChild.remove();
    appendMessage('bot', text);
  } catch (err) {
    chatBox.lastChild.remove();
    appendMessage('bot', 'Error: Could not get response.');
  }
  sendButton.disabled = false;
  userInput.focus();
});

// Allow Enter to send message
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});