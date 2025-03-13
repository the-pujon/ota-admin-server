export interface IPackageSSLPayment {
  amount: String;
  // user_id: String;
  currency: String;
  tran_id:String;
  cus_name: String;
  cus_email: String;
  cus_phone: String;
  cus_add1: String;
  status: String;
  travelDate: String;
  numberOfTravelers: String;
  packageTitle: String;
  packageCountry: String;
  notes: String;
  mailData ?: {
    transactionId: String,
    amount: String,
    cus_name: String,
    cus_email: String,
    cus_phone: String,
    countryName: String,
    travelDate: String,
    numberOfTravelers: String,
    notes: String,
    packageTitle: String,
    currentDate: String,
 };
}

export interface IPackageSSLPaymentBookConfirmMail {
  amount: String;
  tran_id: String;
  cus_name: String;
  cus_email: String;
  cus_phone: String;
  countryName: String;
  status: String;
  travelDate: String,
  numberOfTravelers: String,
  packageTitle: String,
  currentDate: any;
}