import mongoose from 'mongoose';
import { ISubTraveler, ITraveler } from './vb.interface';
 
const documentSchema = new mongoose.Schema({
  file: { type: String, required: true }, 
  cloudinary_id: { type: String, required: false }, 
});
 
const subTravelerSchema = new mongoose.Schema<ISubTraveler>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  localAddress: { type: String, required: true },
  specialNotes: { type: String, required: false },
  visaType: { type: String },
  passport_img: [documentSchema],
  photo_img: [documentSchema],
  bankStatement_pdf: [documentSchema],
  bankSolvencyCertificate: [documentSchema],
  visitingCard: [documentSchema],
  hotelBooking: [documentSchema],
  airTicket: [documentSchema],
  jobDocument: [documentSchema],
  studentDocument: [documentSchema],
  businessPersonDocument: [documentSchema],
  otherDocument: [documentSchema],
});
 
const travelerSchema = new mongoose.Schema<ITraveler>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  localAddress: { type: String, required: true },
  specialNotes: { type: String },
  visaType: { type: String, required: true },
  passport_img: [documentSchema],
  photo_img: [documentSchema],
  bankStatement_pdf: [documentSchema],
  bankSolvencyCertificate: [documentSchema],
  visitingCard: [documentSchema],
  hotelBooking: [documentSchema],
  airTicket: [documentSchema],
 
  jobDocument: [documentSchema],
  studentDocument: [documentSchema],
  businessPersonDocument: [documentSchema],
  otherDocument: [documentSchema],
 
  Travelers: [subTravelerSchema],
});
 
export const TravelerModelBig = mongoose.model<ITraveler>('travelerBooking', travelerSchema);
 