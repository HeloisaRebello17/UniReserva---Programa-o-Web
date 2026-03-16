INSERT INTO users (name, email, password, type)
VALUES
  ('Administrador', 'admin@unireserva.com', 'admin123', 'admin'),
  ('Professor Demo', 'professor@unireserva.com', 'prof123', 'teacher')
ON CONFLICT (email) DO NOTHING;

INSERT INTO rooms (name, capacity, type)
VALUES
  ('Sala 101', 30, 'sala comum'),
  ('Laboratório 02', 25, 'laboratório'),
  ('Auditório', 80, 'sala comum')
ON CONFLICT DO NOTHING;
