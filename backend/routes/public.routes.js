const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/homepage', publicController.getHomepageData);

module.exports = router;