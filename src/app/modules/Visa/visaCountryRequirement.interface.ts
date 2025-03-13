import { Model } from "mongoose";


export interface IVisaCountryRequirement extends Document {
  visaCountryId: string;
  general_documents: Array<{ title: string, details: string[], icon: string }>;
  business_person: Array<{ title: string, details: string[], icon: string }>;
  student: Array<{ title: string, details: string[], icon: string }>;
  job_holder: Array<{ title: string, details: string[], icon: string }>;
  other_documents: Array<{ title: string, details: string[], icon: string }>;
}
