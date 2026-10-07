const userRepository = require('../repositories/userRepository');

/**
 * User Entity Class
 * Represents a single User object in the application domain.
 */
class User {
  constructor({ id, name, email, createdAt, updatedAt } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Returns a sanitized user object safe for client responses (no sensitive data).
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      ...(this.updatedAt ? { updatedAt: this.updatedAt } : {})
    };
  }
}

/**
 * User Model
 * Coordinates data operations and business rules for User entities,
 * delegating persistence to the local file-based repository layer.
 */
const UserModel = {
  /**
   * Retrieves all users (sanitized, excluding passwords/hashes).
   * @returns {Array<Object>} List of user objects
   */
  getAllUsers() {
    return userRepository.findAll();
  },

  /**
   * Finds a specific user by their ID.
   * @param {string|number} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  getUserById(id) {
    const user = userRepository.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      ...(user.updatedAt ? { updatedAt: user.updatedAt } : {})
    };
  },

  /**
   * Finds a user by their email address.
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not found
   */
  getUserByEmail(email) {
    return userRepository.findByEmail(email);
  },

  /**
   * Creates and persists a new user with secure password hashing.
   * @param {Object} userData - User data containing name, email, and password
   * @returns {Object} Created user's public information
   */
  createUser(userData) {
    return userRepository.create(userData);
  },

  /**
   * Updates an existing user's information.
   * @param {string|number} id - Target user ID
   * @param {Object} userData - Fields to update (name, email, password)
   * @returns {Object|null} Updated user object or null if not found
   */
  updateUser(id, userData) {
    return userRepository.update(id, userData);
  },

  /**
   * Deletes a user by ID.
   * @param {string|number} id - Target user ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteUser(id) {
    return userRepository.delete(id);
  }
};

module.exports = UserModel;
module.exports.UserModel = UserModel;
module.exports.User = User;
