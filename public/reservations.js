const loadReservationsButton = document.getElementById('load-reservations');
const reservationForm = document.getElementById('reservation-form');
const roomTypesSection = document.getElementById('room-types');
const roomSelect = document.getElementById('roomId');
const dateInput = document.getElementById('date');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const sessionStatus = document.getElementById('session-status');
const reservationStatus = document.getElementById('reservation-status');
const reservationList = document.getElementById('reservation-list');
const logoutButton = document.getElementById('logout-button');
const reservationSectionTitle = document.getElementById('reservation-section-title');
const adminRoomPanel = document.getElementById('admin-room-panel');
const roomForm = document.getElementById('room-form');
const roomStatus = document.getElementById('room-status');
const roomAdminList = document.getElementById('room-admin-list');

const SESSION_STORAGE_KEY = 'unireserva-auth';

const state = {
  token: null,
  user: null,
  allRooms: []
};

function isAdmin() {
  return state.user && state.user.type === 'admin';
}

const today = new Date().toISOString().split('T')[0];
document.getElementById('date').value = today;

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

function setAuthenticatedUI(isAuthenticated) {
  reservationForm.querySelector('button[type="submit"]').disabled = !isAuthenticated;
  loadReservationsButton.disabled = !isAuthenticated;

  if (isAuthenticated && state.user) {
    const profileLabel = isAdmin() ? 'Administrador' : 'Professor';
    setStatus(sessionStatus, `Sessão ativa: ${state.user.name} (${profileLabel}).`, 'success');
    logoutButton.style.display = 'inline-block';
    adminRoomPanel.style.display = isAdmin() ? 'block' : 'none';
    reservationSectionTitle.textContent = isAdmin() ? 'Todas as reservas' : 'Minhas reservas';
    loadRooms();
    loadReservationsButton.click();
  } else {
    setStatus(sessionStatus, 'Sessão expirada. Redirecionando para login...', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }
}

function restoreSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const parsedSession = JSON.parse(storedSession);
    state.token = parsedSession.token || null;
    state.user = parsedSession.user || null;

    if (!state.token || !state.user) {
      window.location.href = 'login.html';
      return;
    }
  } catch (error) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'login.html';
  }
}

function clearSession(message) {
  state.token = null;
  state.user = null;
  saveSession();
  roomTypesSection.innerHTML = '';
  reservationList.innerHTML = '';
  roomAdminList.innerHTML = '';
  adminRoomPanel.style.display = 'none';
  if (message) {
    setStatus(sessionStatus, message, 'error');
  }
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);
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
    if (response.status === 401) {
      clearSession('Sua sessão expirou ou o token é inválido. Faça login novamente.');
      throw new Error('Sessão expirada');
    }
    throw new Error(data.message || 'Falha na requisição.');
  }

  return data;
}

async function loadRooms() {
  try {
    const rooms = await apiRequest('/api/rooms');
    state.allRooms = rooms;
    displayRoomsByType(rooms);
    renderAdminRoomList(rooms);
    updateAvailableRoomsSelect();
  } catch (error) {
    setStatus(reservationStatus, error.message, 'error');
  }
}

function renderAdminRoomList(rooms) {
  if (!isAdmin()) {
    roomAdminList.innerHTML = '';
    return;
  }

  if (!rooms.length) {
    roomAdminList.innerHTML = '<li>Nenhuma sala cadastrada.</li>';
    return;
  }

  roomAdminList.innerHTML = rooms
    .map(
      (room) => `<li><strong>${room.name}</strong> - ${room.type} - capacidade ${room.capacity} <button type="button" class="small-button" data-room-delete-id="${room.id}">Excluir</button></li>`
    )
    .join('');
}

function displayRoomsByType(rooms) {
  if (!rooms.length) {
    roomTypesSection.innerHTML = '<p class="status">Nenhuma sala disponível para o período selecionado.</p>';
    return;
  }

  // Agrupar salas por tipo
  const roomsByType = {};
  rooms.forEach(room => {
    if (!roomsByType[room.type]) {
      roomsByType[room.type] = [];
    }
    roomsByType[room.type].push(room);
  });

  roomTypesSection.innerHTML = Object.entries(roomsByType)
    .map(([type, typeRooms]) => `
      <div class="room-type-card">
        <h4>${type.toUpperCase()}</h4>
        <ul>
          ${typeRooms.map(room => `
            <li>${room.name} (capacidade: ${room.capacity})</li>
          `).join('')}
        </ul>
      </div>
    `).join('');
}

function getAvailableRooms(allReservations, date, startTime, endTime) {
  return state.allRooms.filter((room) => {
    const hasConflict = allReservations.some((res) =>
      res.roomId === room.id &&
      res.date === date &&
      res.status !== 'cancelada' &&
      res.startTime < endTime &&
      res.endTime > startTime
    );
    return !hasConflict;
  });
}

async function updateAvailableRoomsSelect() {
  const date = dateInput.value;
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (!date || !startTime || !endTime) {
    roomSelect.innerHTML = '<option value="">-- Preencha data e horários --</option>';
    return;
  }

  if (endTime <= startTime) {
    roomSelect.innerHTML = '<option value="">-- Horário inválido: fim deve ser maior que início --</option>';
    return;
  }

  try {
    const allReservations = await apiRequest('/api/reservations');
    const availableRooms = getAvailableRooms(allReservations, date, startTime, endTime);

    // O quadro principal também reflete somente salas disponíveis no período.
    displayRoomsByType(availableRooms);

    if (availableRooms.length === 0) {
      roomSelect.innerHTML = '<option value="">-- Nenhuma sala disponível neste horário --</option>';
      return;
    }

    roomSelect.innerHTML = '<option value="">-- Selecione uma sala --</option>' +
      availableRooms
        .map(room => `<option value="${room.id}">${room.name} - ${room.type} (cap: ${room.capacity})</option>`)
        .join('');
  } catch (error) {
    console.error('Erro ao atualizar salas disponíveis:', error);
  }
}

// Atualizar salas disponíveis quando data/horários mudam
dateInput.addEventListener('change', updateAvailableRoomsSelect);
startTimeInput.addEventListener('change', updateAvailableRoomsSelect);
endTimeInput.addEventListener('change', updateAvailableRoomsSelect);

reservationForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(reservationForm);
  const startTime = formData.get('startTime');
  const endTime = formData.get('endTime');
  const roomId = Number(formData.get('roomId'));

  if (endTime <= startTime) {
    setStatus(reservationStatus, 'O horário de fim deve ser maior que o horário de início.', 'error');
    return;
  }

  if (!roomId) {
    setStatus(reservationStatus, 'Selecione uma sala válida.', 'error');
    return;
  }

  try {
    const reservation = await apiRequest('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        roomId: roomId,
        date: formData.get('date'),
        startTime,
        endTime
      })
    });

    setStatus(reservationStatus, `Reserva #${reservation.id} criada com sucesso!`, 'success');
    
    // Limpar formulário
    reservationForm.reset();
    dateInput.value = today;
    startTimeInput.value = '19:00';
    endTimeInput.value = '20:00';
    roomSelect.innerHTML = '<option value="">-- Selecione uma sala --</option>';
    
    // Atualizar listas
    updateAvailableRoomsSelect();
    setTimeout(() => {
      loadReservationsButton.click();
    }, 500);
  } catch (error) {
    setStatus(reservationStatus, error.message, 'error');
  }
});

loadReservationsButton.addEventListener('click', async () => {
  try {
    const reservations = await apiRequest('/api/reservations');

    const canViewAll = isAdmin();
    const visibleReservations = canViewAll
      ? reservations
      : reservations.filter((r) => Number(r.userId) === Number(state.user.id));

    if (visibleReservations.length === 0) {
      reservationList.innerHTML = '<li>Nenhuma reserva realizada até o momento.</li>';
      return;
    }

    reservationList.innerHTML = visibleReservations
      .map((reservation) => {
        const room = state.allRooms.find(r => r.id === reservation.roomId);
        const roomName = room ? room.name : `Sala ${reservation.roomId}`;
        const ownerText = canViewAll ? ` - usuário ${reservation.userId}` : '';
        const canCancel = reservation.status === 'ativa' && (canViewAll || Number(reservation.userId) === Number(state.user.id));
        const cancelButton = canCancel
          ? ` <button type="button" class="small-button" data-reservation-cancel-id="${reservation.id}">Cancelar</button>`
          : '';
        return `<li><strong>Reserva #${reservation.id}</strong> - ${roomName}${ownerText} - ${reservation.date} de ${reservation.startTime} às ${reservation.endTime} - <span style="color: ${reservation.status === 'ativa' ? 'green' : 'red'};">${reservation.status}</span>${cancelButton}</li>`;
      })
      .join('');
  } catch (error) {
    setStatus(reservationStatus, error.message, 'error');
  }
});

reservationList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-reservation-cancel-id]');
  if (!button) {
    return;
  }

  const reservationId = Number(button.getAttribute('data-reservation-cancel-id'));
  if (!reservationId) {
    return;
  }

  try {
    await apiRequest(`/api/reservations/${reservationId}`, {
      method: 'DELETE'
    });

    setStatus(reservationStatus, `Reserva #${reservationId} cancelada com sucesso.`, 'success');
    loadReservationsButton.click();
    updateAvailableRoomsSelect();
  } catch (error) {
    setStatus(reservationStatus, error.message, 'error');
  }
});

roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!isAdmin()) {
    return;
  }

  const formData = new FormData(roomForm);
  try {
    await apiRequest('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        capacity: Number(formData.get('capacity')),
        type: formData.get('type')
      })
    });

    roomForm.reset();
    setStatus(roomStatus, 'Sala adicionada com sucesso.', 'success');
    loadRooms();
  } catch (error) {
    setStatus(roomStatus, error.message, 'error');
  }
});

roomAdminList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-room-delete-id]');
  if (!button || !isAdmin()) {
    return;
  }

  const roomId = Number(button.getAttribute('data-room-delete-id'));
  if (!roomId) {
    return;
  }

  try {
    await apiRequest(`/api/rooms/${roomId}`, {
      method: 'DELETE'
    });

    setStatus(roomStatus, `Sala #${roomId} excluída com sucesso.`, 'success');
    loadRooms();
    loadReservationsButton.click();
  } catch (error) {
    setStatus(roomStatus, error.message, 'error');
  }
});

logoutButton.addEventListener('click', () => {
  clearSession('Sessão encerrada. Redirecionando para login...');
});

// Restaura sessão ao carregar a página
restoreSession();
setAuthenticatedUI(Boolean(state.token && state.user));
