const { db } = require('../config/db');

const TransactionModel = {
  async create({ receipt_number, user_id, staff_id, total_amount, payment_method, items }) {
    // Insert transaction
    const transaction = await db.transactions.insert({
      receipt_number, user_id: user_id || null, staff_id,
      total_amount: parseFloat(total_amount), payment_method
    });

    // Insert transaction items and update stock
    for (const item of items) {
      await db.transaction_items.insert({
        transaction_id: transaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        subtotal: parseFloat(item.subtotal)
      });
      // Deduct stock
      const product = await db.products.findById(item.product_id);
      if (product) {
        await db.products.update(product.id, { stock: product.stock - item.quantity });
      }
    }

    return transaction.id;
  },

  async getAll() {
    const transactions = await db.transactions.getAll();
    const sortedTransactions = transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return Promise.all(sortedTransactions.map(async t => {
      const user = t.user_id ? await db.users.findById(t.user_id) : null;
      const staff = await db.users.findById(t.staff_id);
      return {
        ...t,
        user_name: user ? user.name : null,
        staff_name: staff ? staff.name : null
      };
    }));
  },

  async getById(id) {
    const transaction = await db.transactions.findById(id);
    if (!transaction) return null;

    const user = transaction.user_id ? await db.users.findById(transaction.user_id) : null;
    const staff = await db.users.findById(transaction.staff_id);
    const items = await db.transaction_items.find({ transaction_id: id });
    
    const itemsWithProductName = await Promise.all(items.map(async item => {
      const product = await db.products.findById(item.product_id);
      return { ...item, product_name: product ? product.name : 'Unknown' };
    }));

    return {
      ...transaction,
      user_name: user ? user.name : null,
      staff_name: staff ? staff.name : null,
      items: itemsWithProductName
    };
  },

  async getByUserId(userId) {
    const transactions = await db.transactions.find({ user_id: userId });
    const sortedTransactions = transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return Promise.all(sortedTransactions.map(async t => {
      const staff = await db.users.findById(t.staff_id);
      return { ...t, staff_name: staff ? staff.name : null };
    }));
  },

  async getByStaffId(staffId) {
    const transactions = await db.transactions.find({ staff_id: staffId });
    const sortedTransactions = transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return Promise.all(sortedTransactions.map(async t => {
      const user = t.user_id ? await db.users.findById(t.user_id) : null;
      return { ...t, user_name: user ? user.name : null };
    }));
  },

  async getSalesByCategory(period = 'monthly') {
    const now = new Date();
    let cutoffDate;
    if (period === 'weekly') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const allTransactions = await db.transactions.getAll();
    const transactions = allTransactions.filter(t => new Date(t.created_at) >= cutoffDate);
    const categorySales = {};

    for (const t of transactions) {
      const items = await db.transaction_items.find({ transaction_id: t.id });
      for (const item of items) {
        const product = await db.products.findById(item.product_id);
        if (product) {
          const cat = product.category;
          if (!categorySales[cat]) {
            categorySales[cat] = { category: cat, total_sales: 0, transaction_count: new Set() };
          }
          categorySales[cat].total_sales += item.subtotal;
          categorySales[cat].transaction_count.add(t.id);
        }
      }
    }

    return Object.values(categorySales)
      .map(c => ({ ...c, transaction_count: c.transaction_count.size }))
      .sort((a, b) => b.total_sales - a.total_sales);
  },

  async getTopProducts(period = 'monthly') {
    const now = new Date();
    let cutoffDate;
    if (period === 'weekly') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const allTransactions = await db.transactions.getAll();
    const transactions = allTransactions.filter(t => new Date(t.created_at) >= cutoffDate);
    const productSales = {};

    for (const t of transactions) {
      const items = await db.transaction_items.find({ transaction_id: t.id });
      for (const item of items) {
        const product = await db.products.findById(item.product_id);
        if (product) {
          if (!productSales[product.id]) {
            productSales[product.id] = { name: product.name, category: product.category, total_quantity: 0, total_sales: 0 };
          }
          productSales[product.id].total_quantity += item.quantity;
          productSales[product.id].total_sales += item.subtotal;
        }
      }
    }

    return Object.values(productSales)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10);
  },

  async getSalesSummary(period = 'monthly') {
    const now = new Date();
    let cutoffDate;
    if (period === 'weekly') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const allTransactions = await db.transactions.getAll();
    const transactions = allTransactions.filter(t => new Date(t.created_at) >= cutoffDate);
    const total_transactions = transactions.length;
    const total_revenue = transactions.reduce((sum, t) => sum + t.total_amount, 0);

    return { total_transactions, total_revenue };
  },

  async getRecentTransactions(limit = 10) {
    const allTransactions = await db.transactions.getAll();
    const transactions = allTransactions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    return Promise.all(transactions.map(async t => {
      const user = t.user_id ? await db.users.findById(t.user_id) : null;
      const staff = await db.users.findById(t.staff_id);
      return {
        ...t,
        user_name: user ? user.name : null,
        staff_name: staff ? staff.name : null
      };
    }));
  },

  async getCount() {
    return await db.transactions.count();
  }
};

module.exports = TransactionModel;