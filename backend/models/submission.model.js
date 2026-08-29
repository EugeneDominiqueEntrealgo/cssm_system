const { db } = require('../config/db');

const SubmissionModel = {
  async create({ type, data, submitted_by }) {
    const submission = await db.pending_submissions.insert({
      type, data: typeof data === 'object' ? data : JSON.parse(data),
      submitted_by, status: 'pending'
    });
    return submission.id;
  },

  async getAll(status = 'pending') {
    const submissions = await db.pending_submissions.find({ status });
    const sortedSubmissions = submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return Promise.all(sortedSubmissions.map(async s => {
      const user = await db.users.findById(s.submitted_by);
      return { ...s, submitted_by_name: user ? user.name : 'Unknown' };
    }));
  },

  async getById(id) {
    const submission = await db.pending_submissions.findById(id);
    if (!submission) return null;
    const user = await db.users.findById(submission.submitted_by);
    return { ...submission, submitted_by_name: user ? user.name : 'Unknown' };
  },

  async getByUserId(userId) {
    const submissions = await db.pending_submissions.find({ submitted_by: userId });
    return submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getByType(type, status = 'pending') {
    const submissions = await db.pending_submissions.find({ type, status });
    return submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async updateStatus(id, status, admin_notes = null) {
    const updates = { status, reviewed_at: new Date().toISOString() };
    if (admin_notes) updates.admin_notes = admin_notes;
    return await db.pending_submissions.update(id, updates);
  },

  async getPendingCount() {
    const submissions = await db.pending_submissions.find({ status: 'pending' });
    return submissions.length;
  }
};

module.exports = SubmissionModel;