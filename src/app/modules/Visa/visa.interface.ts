import { Model } from "mongoose";

export interface IVisaCountry {
  countryName: string;
  visaType: string;
  customId: string;
  title: string;
  subtitle:string;
  description: string;
  images: string[];
  locationImages: [{
    image:  string ,
    location: string 
  }],               
  capital: string;
  time: string;
  telephone_code: string;        
  bank_time: string;        
  embassy_address: string;
  note: { text: string }[]; 
  visaPrice_mainText: string;
  visaPrice_price: string;
  visaPrice_note: string;            

}

export interface IVisaCountryRequirement extends Document {
  visaCountryId: string;
  general_documents: Array<{ title: string, details: string[], icon: string}>;
  business_person: Array<{ title: string, details: string[], icon: string}>;
  student: Array<{ title: string, details: string[], icon: string }>;
  job_holder: Array<{ title: string, details: string[], icon: string }>;
  other_documents: Array<{ title: string, details: string[], icon: string }>;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}