const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'staff'), transactionController.getAll);
router.get('/my', authenticate, authorize('client'), transactionController.getMyTransactions);
router.get('/staff', authenticate, authorize('staff'), transactionController.getByStaff);
router.post('/walk-in-request', authenticate, authorize('client'), transactionController.createWalkInRequest);
router.get('/walk-in-requests/pending', authenticate, authorize('staff'), transactionController.getPendingWalkInRequests);
router.post('/walk-in-requests/:id/complete', authenticate, authorize('staff'), transactionController.completeWalkInRequest);
router.get('/:id', authenticate, authorize('admin', 'staff', 'client'), transactionController.getById);
router.post('/', authenticate, authorize('admin', 'staff'), transactionController.create);

module.exports = router;