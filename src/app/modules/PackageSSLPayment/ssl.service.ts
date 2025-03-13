import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IPackageSSLPayment, IPackageSSLPaymentBookConfirmMail } from "./ssl.interface";
import { PackageSSLPayment } from "./sslPayment.model";
import { VisaCountry } from "../Visa/visaCountry.model";
import { sendEmail, getEmailTemplate } from "../../utils/sendEmail";

const makeSSlPayment = async (payload: IPackageSSLPayment) => {
  const {
    amount,
    status,
    packageCountry,
    packageTitle,
    travelDate,
    numberOfTravelers,
    currency,
    tran_id,
    cus_name,
    cus_email,
    cus_phone,
    cus_add1,
    mailData,
    notes,
  } = payload;

  try {
    const newPaymentInfo = await PackageSSLPayment.create({
      amount,
      status,
      packageCountry,
      packageTitle,
      travelDate,
      numberOfTravelers,
      currency,
      tran_id,
      cus_name,
      cus_email,
      cus_phone,
      cus_add1,
      mailData,
      notes,
    });
    return {
      newPaymentInfo,
    };
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Error making payment: ' + error);
  }
};

const packageBookingConfirmationMail = async (payload: IPackageSSLPaymentBookConfirmMail) => {
  
  try {
    const { amount, cus_name, cus_email, cus_phone, countryName, currentDate, status,tran_id ,packageTitle,numberOfTravelers,travelDate } = payload;
    const emailTemplate = getEmailTemplate('packageBookingConfirmationMail.html', payload);
    await sendEmail({
      to: cus_email,
      subject: `Booking ${status}: Visa Service for ${countryName} - TripNest Limited`,
      html: emailTemplate,
        });
        console.log('Email sent successfully');
        } catch (error) {
          console.error('Error sending email:', error);
        }
    };

export const PackageSSLServices = {
  makeSSlPayment,
  packageBookingConfirmationMail
};
