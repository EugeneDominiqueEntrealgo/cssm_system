const UserModel = require('../models/user.model');
const ProductModel = require('../models/product.model');
const PromoModel = require('../models/promo.model');
const TransactionModel = require('../models/transaction.model');
const SubmissionModel = require('../models/submission.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await UserModel.getCount();
    const totalProducts = await ProductModel.getCount();
    const totalTransactions = await TransactionModel.getCount();
    const pendingStaff = (await UserModel.getPendingStaff()).length;
    const pendingClients = (await UserModel.getPendingClients()).length;
    const pendingSubmissions = await SubmissionModel.getPendingCount();
    const recentTransactions = await TransactionModel.getRecentTransactions(5);

    res.json({
      totalUsers,
      totalProducts,
      totalTransactions,
      pendingStaff,
      pendingClients,
      pendingSubmissions,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPendingStaff = async (req, res) => {
  try {
    const pending = await UserModel.getPendingStaff();
    res.json(pending);
  } catch (error) {
    console.error('Get pending staff error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPendingClients = async (req, res) => {
  try {
    const pending = await UserModel.getPendingClients();
    res.json(pending);
  } catch (error) {
    console.error('Get pending clients error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.approveStaff = async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'rejected'
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active" or "rejected".' });
    }
    await UserModel.updateStatus(req.params.id, status);
    res.json({ message: `Staff account ${status === 'active' ? 'approved' : 'rejected'} successfully.` });
  } catch (error) {
    console.error('Approve staff error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await SubmissionModel.getAll('pending');
    res.json(submissions);
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await SubmissionModel.getByUserId(req.user.id);
    res.json(submissions);
  } catch (error) {
    console.error('Get staff submissions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.approveSubmission = async (req, res) => {
  try {
    const { status, admin_notes } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }

    const submission = await SubmissionModel.getById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    if (status === 'approved') {
      const data = submission.data;
      switch (submission.type) {
        case 'product':
          await ProductModel.create({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            image_url: data.image_url,
            expiry_date: data.expiry_date,
            status: 'active',
            created_by: submission.submitted_by
          });
          break;
        case 'promo':
          await PromoModel.create({
            title: data.title,
            description: data.description,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            start_date: data.start_date,
            end_date: data.end_date,
            status: 'active',
            created_by: submission.submitted_by
          });
          break;
        case 'stock_update':
          if (data.product_id) {
            await ProductModel.update(data.product_id, {
              name: data.name,
              description: data.description,
              price: data.price,
              stock: data.stock,
              category: data.category,
              image_url: data.image_url,
              expiry_date: data.expiry_date
            });
          }
          break;
        // Additive: staff-requested password reset — apply simple pattern temp password
        case 'password_reset': {
          const bcrypt = require('bcryptjs');
          const target = await UserModel.findByIdWithPassword(data.target_user_id);
          if (target) {
            const tempPassword = `${String(target.role || 'client').toLowerCase()}123`;
            const saltRounds = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(tempPassword, saltRounds);
            await UserModel.updatePassword(target.id, hashed, true);
          }
          break;
        }
      }
    }

    await SubmissionModel.updateStatus(req.params.id, status, admin_notes);
    res.json({ message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully.` });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'monthly', chart = 'sales_category' } = req.query;
    const validPeriods = ['weekly', 'monthly'];
    const validCharts = ['sales_category', 'top_products'];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Use "weekly" or "monthly".' });
    }
    if (!validCharts.includes(chart)) {
      return res.status(400).json({ message: 'Invalid chart type. Use "sales_category" or "top_products".' });
    }

    let data;
    if (chart === 'sales_category') {
      data = await TransactionModel.getSalesByCategory(period);
    } else {
      data = await TransactionModel.getTopProducts(period);
    }

    const summary = await TransactionModel.getSalesSummary(period);

    res.json({ data, summary, period, chart });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};