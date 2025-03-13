import { Schema, model } from "mongoose";
import { IVisaCountry, IVisaCountryRequirement } from "./visa.interface";
import { string } from "zod";

// Document Schema (Used in VisaCountryRequirement)
const documentSchema = new Schema({
  title: { type: String, required: true },
  details: { type: [String], required: true },
  icon: { type: String, required: true },
});

// Visa Country Requirement Schema
const visaCountryRequirementSchema = new Schema<IVisaCountryRequirement>({
  visaCountryId: { 
    type: String,
    required: true,
    ref: "VisaCountry",
   },
  general_documents: { type: [documentSchema], required: true },
  business_person: { type: [documentSchema], required: true },
  student: { type: [documentSchema], required: true },
  job_holder: { type: [documentSchema], required: true },
  other_documents: { type: [documentSchema], required: false },
});

// Visa Country Schema
const visaCountrySchema = new Schema<IVisaCountry>({
  countryName: { type: String, required: true },
  visaType: { type: String, required: true },
  customId: { type: String, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  locationImages: [
    {
      image: { type: String, required: true },
      location: { type: String, required: true },
    },
  ],
  capital: { type: String, required: true },
  time: { type: String, required: true },
  telephone_code: { type: String, required: true }, 
  bank_time: { type: String, required: true },
  embassy_address: { type: String, required: true },
  note: [{ text: { type: String, required: true } }],
  visaPrice_mainText: { type: String, required: true },
  visaPrice_price: { type: String, required: true },
  visaPrice_note: { type: String, required: true },
}, { timestamps: true });

// Export Models
export const VisaCountry = model<IVisaCountry>("VisaCountry", visaCountrySchema);
export const VisaCountryRequirement = model<IVisaCountryRequirement>("VisaCountryRequirement", visaCountryRequirementSchema);
