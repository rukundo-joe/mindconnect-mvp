// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authError = document.getElementById('auth-error');

  // Toggle between Login and Register forms
  loginTab.addEventListener('click', () => {
    showLoginForm();
  });

  registerTab.addEventListener('click', () => {
    showRegisterForm();
  });

  function showLoginForm() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.add('active-tab');
    loginTab.classList.remove('inactive-tab');
    registerTab.classList.add('inactive-tab');
    registerTab.classList.remove('active-tab');
    authError.innerHTML = '';
  }

  function showRegisterForm() {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerTab.classList.add('active-tab');
    registerTab.classList.remove('inactive-tab');
    loginTab.classList.add('inactive-tab');
    loginTab.classList.remove('active-tab');
    authError.innerHTML = '';
  }

  // Handle Password Visibility Toggle
  const togglePasswordIcons = document.querySelectorAll('.toggle-password');

  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const input = document.querySelector(icon.getAttribute('toggle'));
      if (input.getAttribute('type') === 'password') {
        input.setAttribute('type', 'text');
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.setAttribute('type', 'password');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Handle Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.innerHTML = '';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      displayError('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'chat.html';
      } else {
        displayError(data.message || 'Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login Error:', error);
      displayError('An error occurred. Please try again later.');
    }
  });

  // Handle Registration Form Submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.innerHTML = '';

    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (!email || !password || !confirmPassword) {
      displayError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      displayError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Optionally, log the user in immediately or redirect to login
        displaySuccess('Registration successful! You can now log in.');
        registerForm.reset();
      } else {
        displayError(data.message || 'Registration failed. Please try again.');
      }

    } catch (error) {
      console.error('Registration Error:', error);
      displayError('An error occurred. Please try again later.');
    }
  });

  // Function to display error messages
  function displayError(message) {
    authError.innerHTML = `<p class="text-red-500">${message}</p>`;
  }

  // Function to display success messages
  function displaySuccess(message) {
    authError.innerHTML = `<p class="text-green-500">${message}</p>`;
  }
});
