import express from 'express';
import cors from 'cors'
import { SSLPaymentControllers } from './ssl.controller';

const router = express.Router();

router.post('/initiate-payment',SSLPaymentControllers.makeSSlPayment,);
router.post('/success/:tran_id',SSLPaymentControllers.SSlPaymentSuccess,);
router.post('/fail/:tran_id',SSLPaymentControllers.SSlPaymentFailed,);
router.post('/cancel/:tran_id',SSLPaymentControllers.SSlPaymentCancelled,);
router.get('/paymentList',SSLPaymentControllers.SSLPaymentList,);
router.post('/payment-response', (req, res) => { res.sendStatus(200);});
router.get('/paymentList', (req, res) => { res.sendStatus(200);});

export const SSLPaymentRoutes = router;
