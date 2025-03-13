import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { SSLServices } from "./ssl.service";
const SSLCommerzPayment = require('sslcommerz-lts');
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join((process.cwd(), '.env')) });
import { SSLPayment } from "./sslPayment.model";
import { VisaCountry } from "../Visa/visaCountry.model";
import express from 'express';
import { any } from "zod";
import { ISSLPayment, IVisaSSLPaymentBookConfirmMail } from "./ssl.interface";
const router = express.Router();


const makeSSlPayment= catchAsync(async (req, res) => {
const store_id = "tripnest0live";
const store_passwd = "65F158E91E85489121";
const is_live = true; // true for live, false for sandbox
// const store_id = "abc66fcf4793cc40";
// const store_passwd = "abc66fcf4793cc40@ssl";
// const is_live = false; // true for live, false for sandbox
const {...paymentInfo} = req.body;

 const {
    amount,
    currency,
    status,
    tran_id,
    success_url,
    fail_url,
    cancel_url,
    ipn_url,
    cus_name,
    cus_email,
    cus_phone,
    cus_add1,
    country_id,
  } = req.body;

  const postData = {
    total_amount: amount,
    currency:currency,
    tran_id:tran_id,
    success_url:success_url,
    fail_url:fail_url,
    cancel_url:cancel_url,
    ipn_url,
    cus_name:cus_name,
    cus_email:cus_email,
    cus_phone:cus_phone,
    cus_add1:cus_add1,
    product_profile: 'general',
    product_name: 'Sample Product',
    product_category: 'Sample Category',
    ship_name: cus_name,
    ship_add1: cus_add1,
    ship_city: 'Dhaka',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
    shipping_method: 'NO',
  };

  try {
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const response = await sslcz.init(postData);
        const countryNameDoc = await VisaCountry.findOne({ _id: country_id }).select('countryName');
        const countryName = countryNameDoc ? countryNameDoc.countryName : 'Unknown';
        const currentDate = new Date();
        const mergedPaymentInfo = {
            ...paymentInfo,
            mailData: {
              transactionId: tran_id,
              amount: amount,
              country_id: country_id,
              cus_name: cus_name,
              cus_email: cus_email,
              cus_phone: cus_phone,
              countryName: countryName,
              currentDate: currentDate,
            }
          };
        await SSLServices.makeSSlPayment(mergedPaymentInfo);
      if (response.GatewayPageURL) {
          res.json({ GatewayPageURL: response.GatewayPageURL, tran_id: tran_id });
      } else {
          console.error('Payment initiation failed:', response);
          res.status(500).json({ error: 'Payment initiation failed', details: response });
      }
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ error: 'Server error', details: error });
    }
     

});

const SSlPaymentSuccess = catchAsync(async (req, res) => {
  // const tran_id = req.body.tran_id;
  const tran_id = req.params.tran_id;
  console.log(tran_id)
  const paymentInfo = await SSLPayment.findOneAndUpdate({ tran_id }, {$set: { status: 'success' },},{ new: true });
  console.log(paymentInfo);
  if (!paymentInfo) {
    console.error('Payment not found');
    return res.status(404).redirect(`${process.env.NEXT_PUBLIC_FRONTEND}/payment/success/${tran_id}`);
  }
 const country = await VisaCountry.findOne({ _id: paymentInfo.country_id }).select('countryName');
  if (!country) {
    console.error('Country not found');
    return res.status(404).json({ message: 'Country not found' });
  }
  // console.log(paymentInfo);
  const mailData: IVisaSSLPaymentBookConfirmMail = {
    tran_id: tran_id,
    amount: paymentInfo.amount,
    status: paymentInfo.status,
    country_id: paymentInfo.country_id,
    cus_name: paymentInfo.cus_name,
    cus_email: paymentInfo.cus_email,
    cus_phone: paymentInfo.cus_phone,
    countryName: country.countryName, 
    currentDate: new Date(), 
  };
  await SSLServices.visaBookingConfirmationMail(mailData);
  await SSLPayment.updateOne({ tran_id: tran_id },{ $unset: { mailData: "" }});
  return res.status(200).redirect(`${process.env.NEXT_PUBLIC_FRONTEND}/payment/success/${tran_id}`);
  // return res.status(200).redirect(`https://ota.tripnest.net/payment/success/${tran_id}`);
});


const SSlPaymentCancelled= catchAsync(async (req, res) => {
  const tran_id = req.params.tran_id;
  const paymentInfo = await SSLPayment.findOneAndUpdate({ tran_id }, {$set: { status: 'cancelled' },},{ new: true });
  if (!paymentInfo) {
    console.error('Payment not found');
    return res.status(404).redirect(`${process.env.NEXT_PUBLIC_FRONTEND}/payment/cancel/${tran_id}`);
  }
 const country = await VisaCountry.findOne({ _id: paymentInfo.country_id }).select('countryName');
  if (!country) {
    console.error('Country not found');
    return res.status(404).json({ message: 'Country not found' });
  }
  // console.log(paymentInfo);
  const mailData: IVisaSSLPaymentBookConfirmMail = {
    tran_id: tran_id,
    amount: paymentInfo.amount,
    status: paymentInfo.status,
    country_id: paymentInfo.country_id,
    cus_name: paymentInfo.cus_name,
    cus_email: paymentInfo.cus_email,
    cus_phone: paymentInfo.cus_phone,
    countryName: country.countryName, 
    currentDate: new Date(), 
  };
  await SSLServices.visaBookingConfirmationMail(mailData);
  await SSLPayment.updateOne({ tran_id: tran_id },{ $unset: { mailData: "" }});
  // res.status(200).redirect(`https://ota.tripnest.net/payment/cancel/${tran_id}`);
  res.status(200).redirect(`${process.env.NEXT_PUBLIC_FRONTEND}/payment/cancel/${tran_id}`);
});


const SSlPaymentFailed= catchAsync(async (req, res) => {
  const tran_id = req.body.tran_id;
  const paymentInfo = await SSLPayment.findOneAndUpdate({ tran_id }, {$set: { status: 'failed' }},{ new: true });
  if (!paymentInfo) {
    console.error('Payment not found');
    return res.status(404).redirect(`${process.env.NEXT_PUBLIC_FRONTEND}/payment/fail/${tran_id}`);
  }
 const country = await VisaCountry.findOne({ _id: paymentInfo.country_id }).select('countryName');
  if (!country) {
    console.error('Country not found');
    return res.status(404).json({ message: 'Country not found' });
  }
  const mailData: IVisaSSLPaymentBookConfirmMail = {
    tran_id: tran_id,
    amount: paymentInfo.amount,
    status: paymentInfo.status,
    country_id: paymentInfo.country_id,
    cus_name: paymentInfo.cus_name,
    cus_email: paymentInfo.cus_email,
    cus_phone: paymentInfo.cus_phone,
    countryName: country.countryName, 
    currentDate: new Date(), 
  };
  await SSLServices.visaBookingConfirmationMail(mailData);
  await SSLPayment.updateOne({ tran_id: tran_id },{ $unset: { mailData: "" }});
res.status(200).redirect(`${process.env.NEXT_PUBLIC_FRONTEND}/payment/fail/${tran_id}`);
});

const SSLPaymentList = catchAsync(async (req, res) => {
  try {
    const payments = await SSLPayment.find();
    res.status(httpStatus.OK).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error retrieving payments: ' + error,
    });
  }
});

export const SSLPaymentControllers = {
  makeSSlPayment,
  SSlPaymentSuccess,
  SSlPaymentCancelled,
  SSlPaymentFailed,
  SSLPaymentList
};



