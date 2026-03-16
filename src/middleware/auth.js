const authService = require('../services/authService');

function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = authService.verifyToken(token);
    req.user = {
      id: Number(decoded.sub),
      email: decoded.email,
      type: decoded.type,
      name: decoded.name
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

function ensureAdmin(req, res, next) {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Apenas administradores podem executar esta ação.' });
  }

  return next();
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin
};
