const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');

const SESSION_STORAGE_KEY = 'unireserva-auth';

const state = {
  token: null,
  user: null
};

function saveSession() {
  if (!state.token || !state.user) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      token: state.token,
      user: state.user
    })
  );
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type || ''}`.trim();
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Falha na requisição.');
  }

  return data;
}

function restoreSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) {
    return;
  }

  try {
    const parsedSession = JSON.parse(storedSession);
    state.token = parsedSession.token || null;
    state.user = parsedSession.user || null;

    if (state.token && state.user) {
      setStatus(loginStatus, `Login restaurado para ${state.user.name}. Redirecionando...`, 'success');
      setTimeout(() => {
        window.location.href = 'reservations.html';
      }, 1500);
    }
  } catch (error) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });

    state.token = data.token;
    state.user = data.user;
    saveSession();
    setStatus(loginStatus, `Login realizado como ${data.user.name}. Redirecionando...`, 'success');
    
    setTimeout(() => {
      window.location.href = 'reservations.html';
    }, 1500);
  } catch (error) {
    setStatus(loginStatus, error.message, 'error');
  }
});

// Verifica se já existe uma sessão ativa
restoreSession();
