const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'unireserva-secret';

async function register({ name, email, password, type = 'common' }) {
  if (!name || !email || !password) {
    throw new Error('Nome, e-mail e senha são obrigatórios.');
  }

  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    throw new Error('Já existe um usuário com este e-mail.');
  }

  return userRepository.createUser({ name, email, password, type });
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('E-mail e senha são obrigatórios.');
  }

  const user = await userRepository.findByEmail(email);
  const passwordMatches = user && user.password === password;

  if (!passwordMatches) {
    throw new Error('Credenciais inválidas.');
  }

  const token = jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      type: user.type,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type
    }
  };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  register,
  login,
  verifyToken
};
