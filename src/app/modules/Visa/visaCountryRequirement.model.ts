import { Schema, model, Document } from "mongoose";
import { IVisaCountryRequirement } from './visa.interface';

const documentSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: [String], 
    required: true
  },
  icon: {
    type: String, 
    required: true,
  }
});

const visaCountryRequirementSchema = new Schema<IVisaCountryRequirement>({
  visaCountryId: {
    type: String,
    required: true
  },
  general_documents: {
    type: [documentSchema],  
    required: true
  },
  business_person: {
    type: [documentSchema],  
    required: true
  },
  student: {
    type: [documentSchema],  
    required: true
  },
  job_holder: {
    type: [documentSchema],  
    required: true
  },
  other_documents: {
    type: [documentSchema],  
    required: false  
  }
});

// export const VisaCountryRequirement = model<IVisaCountryRequirement>('VisaCountryRequirement', visaCountryRequirementSchema);

// export default VisaCountryRequirement;