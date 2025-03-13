import { z } from "zod";

// Document Schema (Used in VisaCountryRequirement)
const documentSchema = z.object({
  title: z.string().min(1),
  details: z.array(z.string().min(1)),
  icon: z.string().optional(),
});

// Visa Country Requirement Schema
// const visaCountryRequirementSchema = z.object({
//   visaCountryId: z.string().min(1),
//   general_documents: z.array(documentSchema).min(1),
//   business_person: z.array(documentSchema).min(1),
//   student: z.array(documentSchema).min(1),
//   job_holder: z.array(documentSchema).min(1),
//   other_documents: z.array(documentSchema).optional(),
// });

// Visa Country Schema
export const visaValidationSchema = z.object({
  body: z.object({
  countryName: z.string().min(1),
  visaType: z.string().min(1),
  customId: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  locationImages: z.array(
    z.object({
      image: z.string().optional(),
      location: z.string().min(1),
    })
  ),
  capital: z.string().min(1),
  time: z.string().min(1),
  telephone_code: z.string().min(1),
  bank_time: z.string().min(1),
  embassy_address: z.string().min(1),
  note: z.array(z.object({ text: z.string().min(1) })).optional(),
  visaPrice_mainText: z.string().min(1),
  visaPrice_price: z.string().min(1),
  visaPrice_note: z.string().min(1),
  // visaCountryId: z.string().min(1),
  general_documents: z.array(documentSchema).min(1),
  business_person: z.array(documentSchema).min(1),
  student: z.array(documentSchema).min(1),
  job_holder: z.array(documentSchema).min(1),
  other_documents: z.array(documentSchema).optional(),
  })
});

