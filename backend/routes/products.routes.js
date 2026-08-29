const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'staff', 'client'), productController.getAll);
router.get('/low-stock', authenticate, authorize('admin', 'staff'), productController.getLowStock);
router.get('/:id', authenticate, authorize('admin', 'staff', 'client'), productController.getById);
router.post('/', authenticate, authorize('admin', 'staff'), productController.create);
router.put('/:id', authenticate, authorize('admin', 'staff'), productController.update);
router.delete('/:id', authenticate, authorize('admin'), productController.delete);

module.exports = router;