const alumniRepository = require('../repositories/alumniRepository');

/**
 * Alumni Entity
 */
class Alumni {
  constructor({ id, firstName, lastName, email, phone, graduationYear, department,
    currentCompany, jobTitle, city, linkedinUrl, createdAt, updatedAt } = {}) {
    Object.assign(this, { id, firstName, lastName, email, phone, graduationYear, department,
      currentCompany, jobTitle, city, linkedinUrl, createdAt, updatedAt });
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return { ...this, fullName: this.fullName };
  }
}

const wrap = (row) => (row ? new Alumni(row).toJSON() : null);

/**
 * Alumni Model: is kurallarini koordine eder, kalicilik repository'ye devredilir.
 */
const AlumniModel = {
  async getAll(filters) {
    return (await alumniRepository.findAll(filters)).map(wrap);
  },
  async getById(id) {
    return wrap(await alumniRepository.findById(id));
  },
  async getByEmail(email) {
    return wrap(await alumniRepository.findByEmail(email));
  },
  async create(data) {
    return wrap(await alumniRepository.create(data));
  },
  async update(id, data) {
    return wrap(await alumniRepository.update(id, data));
  },
  async delete(id) {
    return alumniRepository.delete(id);
  }
};

module.exports = AlumniModel;
module.exports.Alumni = Alumni;
