const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.js');
const {authenticateToken} = require('../middleware/auth');

//generate midtrans token and payment
router.post('/generate', authenticateToken, controller.generate);

//midtrans notifications webhook (no auth - called by Midtrans)
router.post('/webhook', controller.webhook);

<<<<<<< HEAD
//get payment history for a student
router.get('/history/:studentid', authenticateToken, controller.getPaymentHistory);
=======
//get payment history
router.get('/history', authenticateToken, controller.history);

//get payment history for a student
router.get('/history/:studentid', authenticateToken, controller.historyByID);
>>>>>>> 78de1c750d40d8ca8cd2e6906ed453bd13547652

module.exports = router;