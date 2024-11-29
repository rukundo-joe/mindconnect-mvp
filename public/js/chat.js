document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'dashboard.html';
  }

  const socket = io({
    auth: {
      token: token,
    }
  });

  const messagesDiv = document.getElementById('messages');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const logoutBtn = document.getElementById('logout');

  // Handle Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });

  // Handle incoming messages
  socket.on('message', (msg) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('p-2', 'bg-gray-200', 'rounded');
    messageDiv.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Send message
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text === '') return;

    socket.emit('chatMessage', { text });
    messageInput.value = '';
  });

  // Handle connection errors
  socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
    window.location.href = 'index.html';
  });
});
