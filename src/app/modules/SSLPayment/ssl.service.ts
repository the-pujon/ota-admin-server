import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ISSLPayment, IVisaSSLPaymentBookConfirmMail } from "./ssl.interface";
import { SSLPayment } from "./sslPayment.model";
import { VisaCountry } from "../Visa/visaCountry.model";
import { sendEmail, getEmailTemplate } from "../../utils/sendEmail";

const makeSSlPayment = async (payload: ISSLPayment) => {
  const {
    amount,
    user_id,
    status,
    country_id,
    currency,
    tran_id,
    cus_name,
    cus_email,
    cus_phone,
    cus_add1,
    mailData,
  } = payload;

  try {
    const newPaymentInfo = await SSLPayment.create({
      amount,
      user_id,
      country_id,
      currency,
      tran_id,
      cus_name,
      cus_email,
      cus_phone,
      cus_add1,
      status,
      mailData
    });
    return {
      newPaymentInfo,
    };
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Error making payment: ' + error);
  }
};

const visaBookingConfirmationMail = async (payload: IVisaSSLPaymentBookConfirmMail) => {
  
  try {
    const { amount, country_id, cus_name, cus_email, cus_phone, countryName, currentDate, status,tran_id  } = payload;
    const emailTemplate = getEmailTemplate('visaBookingConfirmationMail.html', payload);
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

export const SSLServices = {
  makeSSlPayment,
  visaBookingConfirmationMail
};
