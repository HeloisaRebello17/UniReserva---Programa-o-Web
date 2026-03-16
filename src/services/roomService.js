const roomRepository = require('../repositories/roomRepository');

async function listRooms() {
  return roomRepository.listRooms();
}

async function createRoom({ name, capacity, type }) {
  if (!name || !capacity || !type) {
    throw new Error('Nome, capacidade e tipo da sala são obrigatórios.');
  }

  return roomRepository.createRoom({
    name,
    capacity: Number(capacity),
    type
  });
}

module.exports = {
  listRooms,
  createRoom
};
