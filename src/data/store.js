const users = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@unireserva.com',
    password: 'admin123',
    type: 'admin'
  },
  {
    id: 2,
    name: 'Professor Demo',
    email: 'professor@unireserva.com',
    password: 'prof123',
    type: 'teacher'
  }
];

const rooms = [
  {
    id: 1,
    name: 'Sala 101',
    capacity: 30,
    type: 'sala comum'
  },
  {
    id: 2,
    name: 'Laboratório 02',
    capacity: 25,
    type: 'laboratório'
  },
  {
    id: 3,
    name: 'Auditório',
    capacity: 80,
    type: 'sala comum'
  }
];

const reservations = [];

module.exports = {
  users,
  rooms,
  reservations
};
