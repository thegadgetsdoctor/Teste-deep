const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];
const visits = [];

// Endpoint para admin resetar senha de qualquer porteiro
app.post('/api/auth/reset-password', auth, onlyAdmin, async (req, res) => {
  try {
    const username = req.body.username || req.body.usuario;
    const newPassword = req.body.newPassword;
    if (!username || !newPassword) return res.status(400).json({ msg: 'Usuário e nova senha são obrigatórios.' });
    const user = users.find(u => u.username === username && u.role === 'user');
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado.' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = true;
    res.json({ msg: 'Senha redefinida com sucesso!' });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao redefinir senha.' });
  }
});
// Endpoint para troca de senha do próprio usuário (porteiro)
app.post('/api/auth/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado.' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Senha atual incorreta.' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    res.json({ msg: 'Senha alterada com sucesso!' });
  } catch {
    res.status(500).json({ msg: 'Erro ao alterar senha.' });
  }
});
const JWT_SECRET = 'supersecretkey';

// Cria usuário admin sempre ao iniciar
(async () => {
  const hashed = await bcrypt.hash('admin', 10);
  users.length = 0;
  users.push({ id: 1, username: 'admin', password: hashed, role: 'admin' });
  console.log('Usuário admin criado: admin/admin');
})();

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword: !!user.mustChangePassword
    }
  });
});


// Middleware de autorização: só admin pode criar usuários
function onlyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Acesso restrito ao administrador.' });
  }
  next();
}

// Cadastro de novos usuários (apenas admin autenticado)
app.post('/api/auth/register', auth, onlyAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ msg: 'Preencha todos os campos.' });
    }
    if (role !== 'user') {
      return res.status(400).json({ msg: 'Só é permitido criar usuários do tipo porteiro.' });
    }
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ msg: 'Usuário já existe.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = users.length ? users[users.length - 1].id + 1 : 1;
  users.push({ id, username, password: hashed, role, mustChangePassword: true });
    res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ msg: 'Erro interno no servidor.' });
  }
});

// Middleware simples de autenticação
function auth(req, res, next) {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({ msg: 'No token, authorization denied' });
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// Visits
app.post('/api/visits', auth, (req, res) => {
  const { name, document } = req.body;
  const id = visits.length ? visits[visits.length - 1].id + 1 : 1;
  const visit = { id, name, document, entryTime: new Date(), createdBy: req.user.id };
  visits.push(visit);
  res.status(201).json(visit);
});

app.get('/api/visits', auth, (req, res) => {
  res.json(visits.map(v => ({ ...v, createdBy: users.find(u => u.id === v.createdBy) })));
});

app.put('/api/visits/:id/exit', auth, (req, res) => {
  const visit = visits.find(v => v.id == req.params.id);
  if (!visit) return res.status(404).json({ msg: 'Visit not found' });
  visit.exitTime = new Date();
  res.json(visit);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
