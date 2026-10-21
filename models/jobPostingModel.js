const jobPostingRepository = require('../repositories/jobPostingRepository');
const jobApplicationRepository = require('../repositories/jobApplicationRepository');

/**
 * JobPosting Model
 * Domain logic and repository coordination for job postings and internal applications.
 */
const JobPostingModel = {
  async getAll(filters) {
    return jobPostingRepository.findAll(filters);
  },

  async getById(id) {
    return jobPostingRepository.findById(id);
  },

  async create(data) {
    return jobPostingRepository.create(data);
  },

  async update(id, data) {
    return jobPostingRepository.update(id, data);
  },

  async delete(id) {
    return jobPostingRepository.delete(id);
  },

  // Applications
  async getApplications(jobPostingId) {
    return jobApplicationRepository.findByPosting(jobPostingId);
  },

  async getApplicationById(id) {
    return jobApplicationRepository.findById(id);
  },

  async getApplicationByUser(jobPostingId, userId) {
    return jobApplicationRepository.findByPostingAndUser(jobPostingId, userId);
  },

  async createApplication(data) {
    return jobApplicationRepository.create(data);
  },

  async updateApplicationStatus(id, status) {
    return jobApplicationRepository.updateStatus(id, status);
  },

  async deleteApplication(id) {
    return jobApplicationRepository.delete(id);
  }
};

module.exports = JobPostingModel;
