const UserModel = require('../models/userModel');
const userRepository = require('../repositories/userRepository');
const { signToken } = require('../config/auth');

function generateAuthToken(user) {
  return signToken(user);
}

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
  },

  /**
   * GET /api/users/:id/jobs
   * Retrieves all job postings created by a specific user.
   */
  async getUserJobs(req, res, id) {
    try {
      const user = UserModel.getUserById(id);
      if (!user) {
        return sendJson(res, 404, { error: 'User not found.' });
      }

      const jobPostingRepository = require('../repositories/jobPostingRepository');
      const jobs = await jobPostingRepository.findAll({ alumniId: id });
      return sendJson(res, 200, jobs);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * POST /api/users/:id/jobs
   * Creates a new job posting associated with a specific user.
   */
  async createUserJob(req, res, id) {
    const user = UserModel.getUserById(id);
    if (!user) {
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

      const { title, description, companyName, employmentType } = parsed;
      if (!title || !description || !companyName || !employmentType) {
        return sendJson(res, 400, {
          error: "Validation failed: 'title', 'description', 'companyName', and 'employmentType' are required."
        });
      }

      const jobPostingRepository = require('../repositories/jobPostingRepository');
      const postingData = {
        ...parsed,
        alumniId: Number(id)
      };

      const created = await jobPostingRepository.create(postingData);
      return sendJson(res, 201, created);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * POST /api/register
   * Registers a new user adhering to DDD Identity context & Security Principles.
   */
  async register(req, res) {
    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const {
        name,
        email,
        password,
        confirmPassword,
        role = 'student',
        studentId,
        department,
        yearOfStudy,
        graduationYear,
        company,
        jobTitle,
        location,
        mentorshipOptIn,
        invitationCode,
        adminBranch,
        masterKey,
        affiliation
      } = parsed;

      // 1. Basic validation
      if (!name || !name.trim() || !email || !email.trim() || !password || !password.trim()) {
        return sendJson(res, 400, { error: 'Name, email, and password are required fields.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return sendJson(res, 400, { error: 'Passwords do not match.' });
      }

      if (password.length < 6) {
        return sendJson(res, 400, { error: 'Password must be at least 6 characters long.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return sendJson(res, 400, { error: 'Invalid email address format.' });
      }

      const targetRole = String(role).trim().toLowerCase();
      const validRoles = ['student', 'alumni', 'admin', 'guest'];
      if (!validRoles.includes(targetRole)) {
        return sendJson(res, 400, { error: `Invalid role selected. Permitted: ${validRoles.join(', ')}` });
      }

      // 2. Uniqueness Check (409 Conflict)
      const existingUser = userRepository.findByEmail(email.trim());
      if (existingUser) {
        return sendJson(res, 409, { error: 'An account with this email address already exists.' });
      }

      // 3. Guest Access Code Gate (403 Forbidden)
      if (targetRole === 'guest') {
        const validCodes = ['ALUMNI-GUEST-2026', 'DEAN-VIP-GUEST', 'INVITE-2026'];
        if (!invitationCode || !validCodes.includes(invitationCode.trim().toUpperCase())) {
          return sendJson(res, 403, {
            error: 'Guest access requires a valid Admin invitation code (e.g. ALUMNI-GUEST-2026).'
          });
        }
      }

      // 4. Admin Master Key Gate (403 Forbidden)
      if (targetRole === 'admin') {
        if (!masterKey || masterKey.trim() !== 'ADMIN-MASTER-2026') {
          return sendJson(res, 403, {
            error: 'Administrator registration requires a valid Institutional Master Key.'
          });
        }
      }

      // 5. Construct Profile Metadata by Role
      const profile = {};
      if (targetRole === 'student') {
        profile.studentId = studentId ? String(studentId).trim() : null;
        profile.department = department ? String(department).trim() : 'Management Information Systems';
        profile.yearOfStudy = yearOfStudy ? String(yearOfStudy).trim() : '3rd Year';
      } else if (targetRole === 'alumni') {
        profile.graduationYear = graduationYear ? Number(graduationYear) : new Date().getFullYear();
        profile.department = department ? String(department).trim() : 'Management Information Systems';
        profile.company = company ? String(company).trim() : null;
        profile.jobTitle = jobTitle ? String(jobTitle).trim() : null;
        profile.location = location ? String(location).trim() : 'Istanbul, TR';
        profile.mentorshipOptIn = Boolean(mentorshipOptIn);
      } else if (targetRole === 'guest') {
        profile.affiliation = affiliation ? String(affiliation).trim() : 'External Guest';
        profile.invitationCode = invitationCode ? String(invitationCode).trim().toUpperCase() : null;
      } else if (targetRole === 'admin') {
        profile.adminBranch = adminBranch === 'academician' ? 'Academician (Faculty)' : 'Representer Student';
      }

      // 6. Persistence with Salt + Hash (Done in repository)
      const createdUser = userRepository.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: targetRole,
        profile
      });

      // 7. Generate Signed Token
      const token = generateAuthToken(createdUser);

      return sendJson(res, 201, {
        success: true,
        message: 'Account registered successfully.',
        token,
        user: createdUser
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error during registration.' });
    }
  },

  /**
   * POST /api/login
   * Authenticates a user and returns an Auth Token.
   * Adheres to Information Leakage Prevention (generic 401 on failure).
   */
  async login(req, res) {
    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { email, password } = parsed;
      if (!email || !password) {
        return sendJson(res, 400, { error: 'Email and password are required.' });
      }

      const user = userRepository.findByEmail(email.trim());
      // IF email not found OR password hash does not match -> Generic 401
      if (!user || !userRepository.verifyPassword(password, user.passwordHash)) {
        return sendJson(res, 401, { error: 'Invalid email or password.' });
      }

      const token = generateAuthToken(user);
      return sendJson(res, 200, {
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'student',
          profile: user.profile || {}
        }
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error during login.' });
    }
  }
};

module.exports = ApiUserController;

