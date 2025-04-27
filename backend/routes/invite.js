const express = require('express');
const router = express.Router();

const inviteController = require('../controllers/inviteController');

router.post('/', inviteController.validateInviteCode);

module.exports = router; 