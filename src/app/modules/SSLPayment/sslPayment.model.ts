import { Model, Schema, model } from 'mongoose';
import { ISSLPayment } from './ssl.interface';


const sslPaymentSchema = new Schema<ISSLPayment>(
  {
    amount: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,  
    },
    country_id: {
      type: String,
      required: true,  
    },
    tran_id: {
      type: String,
      required: true,
    },
    cus_name: {
      type: String,
      required: true,
    },

    cus_email: {
      type: String,
      required: true,
    },
    cus_phone: {
      type: String,
      required: true,
    },
    cus_add1: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    mailData : {
    transactionId: String,
    amount: String,
    country_id: String,
    cus_name: String,
    cus_email: String,
    cus_phone: String,
    countryName: String,
    currentDate: String,
 },

    

},{
    timestamps: true,
  },);

export const SSLPayment = model<ISSLPayment>('SSLPayment', sslPaymentSchema);