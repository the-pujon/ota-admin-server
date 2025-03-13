export interface ISSLPayment {
  amount: String;
  user_id: String;
  country_id: String;
  currency: String;
  tran_id:String;
  cus_name: String;
  cus_email: String;
  cus_phone: String;
  cus_add1: String;
  status: String;
  mailData ?: {
    transactionId: String,
    amount: String,
    country_id: String,
    cus_name: String,
    cus_email: String,
    cus_phone: String,
    countryName: String,
    currentDate: String,
 };
}

export interface IVisaSSLPaymentBookConfirmMail {
  amount: String;
  tran_id: String;
  country_id: String;
  cus_name: String;
  cus_email: String;
  cus_phone: String;
  countryName: String;
  status: String;
  currentDate: any;
}