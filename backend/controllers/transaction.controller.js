const Joi = require('joi');
const TransactionModel = require('../models/transaction.model');
const ProductModel = require('../models/product.model');
const SubmissionModel = require('../models/submission.model');
const UserModel = require('../models/user.model');

const transactionSchema = Joi.object({
  user_id: Joi.number().integer().allow(null),
  items: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  payment_method: Joi.string().valid('cash', 'pos').required()
});

exports.create = async (req, res) => {
  try {
    const { error } = transactionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { user_id, items, payment_method } = req.body;

    // Generate receipt number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const receipt_number = `REC-${dateStr}-${timestamp}`;

    // Calculate total and validate stock
    let total_amount = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await ProductModel.getById(item.product_id);
      if (!product) return res.status(404).json({ message: `Product ID ${item.product_id} not found.` });
      if (product.status !== 'active') return res.status(400).json({ message: `Product "${product.name}" is not available.` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.stock}` });

      const subtotal = product.price * item.quantity;
      total_amount += subtotal;
      transactionItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal
      });
    }

    const transactionId = await TransactionModel.create({
      receipt_number,
      user_id,
      staff_id: req.user.id,
      total_amount,
      payment_method,
      items: transactionItems
    });

    res.status(201).json({
      message: 'Transaction created successfully.',
      transactionId,
      receipt_number
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const transactions = await TransactionModel.getAll();
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const transaction = await TransactionModel.getById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    if (req.user.role === 'client' && Number(transaction.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'You are not allowed to view this transaction.' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.getByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getByStaff = async (req, res) => {
  try {
    const transactions = await TransactionModel.getByStaffId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Get staff transactions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createWalkInRequest = async (req, res) => {
  try {
    const { error } = transactionSchema.validate({
      items: req.body.items,
      payment_method: 'cash'
    });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const items = req.body.items;
    const itemMap = new Map();
    for (const item of items) {
      itemMap.set(item.product_id, (itemMap.get(item.product_id) || 0) + item.quantity);
    }

    const requestItems = [];
    for (const [productId, quantity] of itemMap) {
      const product = await ProductModel.getById(productId);
      if (!product) return res.status(404).json({ message: `Product ID ${productId} not found.` });
      if (product.status !== 'active') return res.status(400).json({ message: `Product "${product.name}" is not available.` });
      if (product.stock < quantity) return res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      requestItems.push({ product_id: product.id, quantity, name: product.name, price: product.price, image_url: product.image_url });
    }

    const submissionId = await SubmissionModel.create({
      type: 'walk_in_order',
      data: { items: requestItems },
      submitted_by: req.user.id
    });

    res.status(201).json({
      message: 'Walk-in order request submitted. Please pay at the store counter.',
      submissionId
    });
  } catch (error) {
    console.error('Create walk-in request error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPendingWalkInRequests = async (req, res) => {
  try {
    const submissions = await SubmissionModel.getAll('pending');
    res.json(submissions.filter((submission) => submission.type === 'walk_in_order'));
  } catch (error) {
    console.error('Get pending walk-in requests error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getCancelledWalkInRequests = async (req, res) => {
  try {
    const submissions = await SubmissionModel.getByType('walk_in_order', 'cancelled');
    res.json(submissions);
  } catch (error) {
    console.error('Get cancelled walk-in requests error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.completeWalkInRequest = async (req, res) => {
  try {
    const submission = await SubmissionModel.getById(req.params.id);
    if (!submission || submission.type !== 'walk_in_order' || submission.status !== 'pending') {
      return res.status(404).json({ message: 'Pending walk-in request not found.' });
    }

    const paymentMethod = req.body.payment_method || 'cash';
    if (!['cash', 'pos'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Payment method must be cash or pos.' });
    }

    const items = Array.isArray(submission.data?.items) ? submission.data.items : [];
    if (!items.length) {
      return res.status(400).json({ message: 'This walk-in request has no items.' });
    }

    const transactionItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await ProductModel.getById(item.product_id);
      if (!product || product.status !== 'active') {
        return res.status(400).json({ message: `Product ID ${item.product_id} is no longer available.` });
      }
      if (Number(product.stock) < Number(item.quantity)) {
        return res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      }

      const subtotal = Number(product.price) * Number(item.quantity);
      totalAmount += subtotal;
      transactionItems.push({
        product_id: product.id,
        quantity: Number(item.quantity),
        unit_price: Number(product.price),
        subtotal,
      });
    }

    const tenderedAmount = Number(req.body.tendered_amount);
    if (!Number.isFinite(tenderedAmount) || tenderedAmount < totalAmount) {
      return res.status(400).json({ message: `Payment must be at least ${totalAmount.toFixed(2)}.` });
    }

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const receiptNumber = `REC-${dateStr}-${Date.now().toString().slice(-6)}`;
    const transactionId = await TransactionModel.create({
      receipt_number: receiptNumber,
      user_id: submission.submitted_by,
      staff_id: req.user.id,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      tendered_amount: tenderedAmount,
      change_amount: tenderedAmount - totalAmount,
      items: transactionItems,
    });

    await SubmissionModel.updateStatus(req.params.id, 'approved', 'Walk-in sale completed at the store counter.');

    res.status(201).json({
      message: 'Walk-in sale completed successfully.',
      transactionId,
      receipt_number: receiptNumber,
      total_amount: totalAmount,
      change: tenderedAmount - totalAmount,
    });
  } catch (error) {
    console.error('Complete walk-in request error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMyWalkInRequests = async (req, res) => {
  try {
    const requests = await SubmissionModel.getClientWalkInRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    console.error('Get my walk-in requests error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.cancelWalkInRequest = async (req, res) => {
  try {
    const submission = await SubmissionModel.getById(req.params.id);
    if (!submission || submission.type !== 'walk_in_order') {
      return res.status(404).json({ message: 'Walk-in order request not found.' });
    }
    if (Number(submission.submitted_by) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'You are not allowed to cancel this order.' });
    }
    if (submission.status !== 'pending') {
      return res.status(409).json({ message: 'This order can no longer be cancelled.' });
    }

    await SubmissionModel.updateStatus(req.params.id, 'cancelled', 'Cancelled by client.');
    res.json({ message: 'Order cancelled successfully.' });
  } catch (error) {
    console.error('Cancel walk-in request error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createStaffWalkInRequest = async (req, res) => {
  try {
    const client = await UserModel.findById(req.body.user_id);
    if (!client || client.role !== 'client' || client.status !== 'active') {
      return res.status(400).json({ message: 'Select an active registered client.' });
    }

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ message: 'Add at least one product to the order.' });
    }

    const itemMap = new Map();
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Each product must have a valid quantity.' });
      }
      itemMap.set(productId, (itemMap.get(productId) || 0) + quantity);
    }

    const requestItems = [];
    for (const [productId, quantity] of itemMap) {
      const product = await ProductModel.getById(productId);
      if (!product) return res.status(404).json({ message: `Product ID ${productId} not found.` });
      if (product.status !== 'active') return res.status(400).json({ message: `Product "${product.name}" is not available.` });
      if (Number(product.stock) < quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      }
      requestItems.push({ product_id: product.id, quantity, name: product.name, price: product.price, image_url: product.image_url });
    }

    const submissionId = await SubmissionModel.create({
      type: 'walk_in_order',
      data: { items: requestItems, guided_by_staff: req.user.id },
      submitted_by: client.id
    });

    res.status(201).json({ message: 'Pending order created for the client.', submissionId });
  } catch (error) {
    console.error('Create staff walk-in request error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};