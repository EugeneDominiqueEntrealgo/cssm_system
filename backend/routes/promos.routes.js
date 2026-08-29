const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'staff', 'client'), promoController.getAll);
router.get('/:id', authenticate, authorize('admin', 'staff', 'client'), promoController.getById);
router.post('/', authenticate, authorize('admin', 'staff'), promoController.create);
router.put('/:id', authenticate, authorize('admin', 'staff'), promoController.update);
router.delete('/:id', authenticate, authorize('admin'), promoController.delete);

module.exports = router;