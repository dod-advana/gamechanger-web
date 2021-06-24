// Router for /api/gamechanger/eda routes
const express = require('express');
const router = express.Router();

const {EDAController} = require('../controllers/edaController');

const edaController = new EDAController();

router.post('/edaContractAward', edaController.queryContractAward);


module.exports = router;