import express from 'express';
import cors from 'cors'
import { PackageSSLPaymentControllers } from './ssl.controller';

const router = express.Router();

router.post('/initiate-payment',PackageSSLPaymentControllers.makeSSlPayment,);
router.post('/success/:tran_id',PackageSSLPaymentControllers.SSlPaymentSuccess,);
router.post('/fail/:tran_id',PackageSSLPaymentControllers.SSlPaymentFailed,);
router.post('/cancel/:tran_id',PackageSSLPaymentControllers.SSlPaymentCancelled,);
router.get('/paymentList',PackageSSLPaymentControllers.SSLPaymentList,);
router.post('/payment-response', (req, res) => { res.sendStatus(200);}); 

export const PackageSSLPaymentRoutes = router;
