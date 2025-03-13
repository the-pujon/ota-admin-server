import { Model, Schema, model } from 'mongoose';
import { IPackageSSLPayment } from './ssl.interface';


const sslPackagePaymentSchema = new Schema<IPackageSSLPayment>(
  {
    amount: {
      type: String,
      required: true,
    },
    // user_id: {
    //   type: String,
    //   required: true,  
    // },
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
    travelDate: {
      type: String,
      required: true,
    },
    numberOfTravelers: {
      type: String,
      required: true,
    },
    packageTitle: {
      type: String,
      required: true,
    },
    packageCountry: {
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

export const PackageSSLPayment = model<IPackageSSLPayment>('PackageSSLPayment', sslPackagePaymentSchema);