document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginPasswordInput = document.getElementById('login-password');
  const togglePassword = document.querySelector('.toggle-password');
  const loginError = document.getElementById('login-error');

  togglePassword.addEventListener('click', () => {
    const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    loginPasswordInput.setAttribute('type', type);

    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = loginPasswordInput.value.trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);

        window.location.href = 'dashboard.html';
      } else {
        loginError.textContent = data.message || 'Login failed. Please try again.';
        loginError.classList.remove('hidden');
      }

    } catch (error) {
      console.error('Login Error:', error);
      loginError.textContent = 'An error occurred. Please try again.';
      loginError.classList.remove('hidden');
    }
  });
});
