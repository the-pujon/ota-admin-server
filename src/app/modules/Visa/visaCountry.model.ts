import { Model, Schema, model } from 'mongoose';
import { IVisaCountry } from './visa.interface';

const visaCountrySchema = new Schema<IVisaCountry>(
  {
    countryName: {
      type: String,
      required: true,
    },
    visaType: {
      type: String,
      required: true,
    },
    customId: {
      type: String,
      // required: true,
      unique: true,  
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [{ type: String, required: true,}],
    locationImages: [
      {
        image: { type: String, required: true,},
        location: { type: String, required: true,},
      },
    ],
    capital: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    telephone_code: {
      type: String,
      required: true,
    },
    bank_time: {
      type: String,
      required: true,
    },
    embassy_address: {
      type: String,
      required: true,
    },
    note: [{
      text: { type: String, 
        required: true 
      }
    }],
    visaPrice_mainText: {
      type: String,
      required: true,
    },
    visaPrice_price: {
      type: String,
      required: true,
    },
    visaPrice_note: {
      type: String,
      required: true,
    },    
  },
  {
    timestamps: true,  
  },
);

// export const VisaCountry = model<IVisaCountry>('VisaCountry', visaCountrySchema);