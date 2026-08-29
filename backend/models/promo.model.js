const { db } = require('../config/db');

const PromoModel = {
  async getAll() {
    return await db.promos.getAll();
  },

  async getById(id) {
    return await db.promos.findById(id);
  },

  async getActive() {
    const promos = await db.promos.find({ status: 'active' });
    return promos.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  },

  async create({ title, description, discount_type, discount_value, start_date, end_date, status, created_by }) {
    const promo = await db.promos.insert({
      title, description, discount_type, discount_value: parseFloat(discount_value),
      start_date, end_date, status: status || 'pending', created_by
    });
    return promo.id;
  },

  async update(id, { title, description, discount_type, discount_value, start_date, end_date, status }) {
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (discount_type !== undefined) updates.discount_type = discount_type;
    if (discount_value !== undefined) updates.discount_value = parseFloat(discount_value);
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (status !== undefined) updates.status = status;
    return await db.promos.update(id, updates);
  },

  async delete(id) {
    return await db.promos.delete(id);
  },

  async getCount() {
    return await db.promos.count();
  }
};

module.exports = PromoModel;