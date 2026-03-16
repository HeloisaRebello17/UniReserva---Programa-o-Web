const express = require('express');
const roomController = require('../controllers/roomController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, roomController.list);
router.post('/', ensureAuthenticated, ensureAdmin, roomController.create);

module.exports = router;
