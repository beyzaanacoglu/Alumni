const UserModel = require('../models/userModel');

/**
 * Helper to parse request body as JSON
 */
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

/**
 * Helper to send JSON responses with status code
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

const ApiUserController = {
  /**
   * GET /api/users
   * Retrieves all users as a JSON array.
   */
  async getAllUsers(req, res) {
    try {
      const users = UserModel.getAllUsers();
      return sendJson(res, 200, users);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * GET /api/users/:id
   * Retrieves a single user by ID.
   */
  async getUserById(req, res, id) {
    try {
      const user = UserModel.getUserById(id);
      if (!user) {
        return sendJson(res, 404, { error: 'User not found.' });
      }
      return sendJson(res, 200, user);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * POST /api/users
   * Creates a new user after validating body and email uniqueness.
   */
  async createUser(req, res) {
    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { name, email, password } = parsed;

      // Required field validation
      if (!name || typeof name !== 'string' || !name.trim() ||
          !email || typeof email !== 'string' || !email.trim() ||
          !password || typeof password !== 'string' || !password.trim()) {
        return sendJson(res, 400, {
          error: "Validation failed: 'name', 'email', and 'password' are required."
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return sendJson(res, 400, {
          error: 'Validation failed: Invalid email format.'
        });
      }

      // Duplicate email check
      const existingUser = UserModel.getUserByEmail(email.trim());
      if (existingUser) {
        return sendJson(res, 409, {
          error: 'Conflict: A user with this email already exists.'
        });
      }

      const createdUser = UserModel.createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim()
      });

      return sendJson(res, 201, {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * PUT /api/users/:id
   * Fully updates an existing user.
   */
  async updateUser(req, res, id) {
    const targetUser = UserModel.getUserById(id);
    if (!targetUser) {
      return sendJson(res, 404, { error: 'User not found.' });
    }

    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { name, email, password } = parsed;

      // Required field validation for full update
      if (!name || typeof name !== 'string' || !name.trim() ||
          !email || typeof email !== 'string' || !email.trim() ||
          !password || typeof password !== 'string' || !password.trim()) {
        return sendJson(res, 400, {
          error: "Validation failed: 'name', 'email', and 'password' are required for a full update."
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return sendJson(res, 400, {
          error: 'Validation failed: Invalid email format.'
        });
      }

      // Duplicate email check (excluding current user)
      const existingWithEmail = UserModel.getUserByEmail(email.trim());
      if (existingWithEmail && String(existingWithEmail.id) !== String(id)) {
        return sendJson(res, 409, {
          error: 'Conflict: Email is already used by another user.'
        });
      }

      const updatedUser = UserModel.updateUser(id, {
        name: name.trim(),
        email: email.trim(),
        password: password.trim()
      });

      return sendJson(res, 200, {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * PATCH /api/users/:id
   * Partially updates provided fields of a user.
   */
  async patchUser(req, res, id) {
    const targetUser = UserModel.getUserById(id);
    if (!targetUser) {
      return sendJson(res, 404, { error: 'User not found.' });
    }

    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { name, email, password } = parsed;

      if (name === undefined && email === undefined && password === undefined) {
        return sendJson(res, 400, {
          error: 'Validation failed: At least one field (name, email, or password) must be provided.'
        });
      }

      const updateData = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
          return sendJson(res, 400, {
            error: "Validation failed: 'name' must be a non-empty string."
          });
        }
        updateData.name = name.trim();
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
          return sendJson(res, 400, {
            error: 'Validation failed: Invalid email format.'
          });
        }

        const existingWithEmail = UserModel.getUserByEmail(email.trim());
        if (existingWithEmail && String(existingWithEmail.id) !== String(id)) {
          return sendJson(res, 409, {
            error: 'Conflict: Email is already used by another user.'
          });
        }
        updateData.email = email.trim();
      }

      if (password !== undefined) {
        if (typeof password !== 'string' || !password.trim()) {
          return sendJson(res, 400, {
            error: "Validation failed: 'password' must be a non-empty string."
          });
        }
        updateData.password = password.trim();
      }

      const updatedUser = UserModel.updateUser(id, updateData);

      return sendJson(res, 200, {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * DELETE /api/users/:id
   * Deletes a user by ID.
   */
  async deleteUser(req, res, id) {
    const targetUser = UserModel.getUserById(id);
    if (!targetUser) {
      return sendJson(res, 404, { error: 'User not found.' });
    }

    try {
      const deleted = UserModel.deleteUser(id);
      if (!deleted) {
        return sendJson(res, 404, { error: 'User not found.' });
      }
      res.writeHead(204);
      return res.end();
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  }
};

module.exports = ApiUserController;
