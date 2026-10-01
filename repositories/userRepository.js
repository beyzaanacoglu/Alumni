const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'data', 'users.json');

function ensureDataFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function getAll() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function saveAll(users) {
  ensureDataFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const userRepository = {
  findByEmail(email) {
    if (!email) return null;
    const users = getAll();
    const normalized = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === normalized) || null;
  },

  findAll() {
    const users = getAll();
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt
    }));
  },

  findById(id) {
    const users = getAll();
    return users.find(u => String(u.id) === String(id)) || null;
  },

  create({ name, email, password }) {
    const users = getAll();
    const nextId = users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1;

    const newUser = {
      id: nextId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveAll(users);

    // Return user without sensitive credentials
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    };
  },

  update(id, fields) {
    const users = getAll();
    const index = users.findIndex(u => String(u.id) === String(id));
    if (index === -1) return null;

    const user = users[index];

    if (fields.name !== undefined) {
      user.name = fields.name.trim();
    }
    if (fields.email !== undefined) {
      user.email = fields.email.trim().toLowerCase();
    }
    if (fields.password !== undefined && fields.password.trim()) {
      user.passwordHash = hashPassword(fields.password.trim());
    }

    user.updatedAt = new Date().toISOString();

    users[index] = user;
    saveAll(users);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  },

  delete(id) {
    const users = getAll();
    const index = users.findIndex(u => String(u.id) === String(id));
    if (index === -1) return false;

    users.splice(index, 1);
    saveAll(users);
    return true;
  }
};

module.exports = userRepository;
