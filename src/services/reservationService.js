const reservationRepository = require('../repositories/reservationRepository');
const roomRepository = require('../repositories/roomRepository');

async function listReservations() {
  return reservationRepository.listReservations();
}

async function createReservation({ date, startTime, endTime, roomId, userId }) {
  if (!date || !startTime || !endTime || !roomId || !userId) {
    throw new Error('Data, horários, sala e usuário são obrigatórios.');
  }

  const normalizedUserId = Number(userId);
  const normalizedRoomId = Number(roomId);
  let room = Number.isFinite(normalizedRoomId)
    ? await roomRepository.findRoomById(normalizedRoomId)
    : null;

  if (!room) {
    room = await roomRepository.findRoomByReference(roomId);
  }

  if (!room) {
    throw new Error('Sala não encontrada.');
  }

  const conflict = await reservationRepository.findConflict({
    date,
    startTime,
    endTime,
    roomId: room.id
  });

  if (conflict) {
    const error = new Error('Já existe uma reserva para esta sala no horário informado.');
    error.code = 'CONFLICT';
    throw error;
  }

  return reservationRepository.createReservation({
    date,
    startTime,
    endTime,
    roomId: room.id,
    userId: normalizedUserId
  });
}

async function cancelReservation(id, requester) {
  const reservation = await reservationRepository.findReservationById(Number(id));
  if (!reservation) {
    throw new Error('Reserva não encontrada.');
  }

  const canCancel = requester.type === 'admin' || reservation.userId === Number(requester.id);
  if (!canCancel) {
    const error = new Error('Usuário sem permissão para cancelar esta reserva.');
    error.code = 'FORBIDDEN';
    throw error;
  }

  return reservationRepository.cancelReservation(Number(id));
}

module.exports = {
  listReservations,
  createReservation,
  cancelReservation
};
