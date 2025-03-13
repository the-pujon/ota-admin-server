import mongoose, { Schema, Document } from "mongoose";
import {
  ICities,
  IDetailedItinerary,
  IExclusions,
  IHighlight,
  IImportantNotes,
  IInclusions,
  IPackage,
} from "./package.interface";

const highlightSchema = new Schema<IHighlight>({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const inclusionsSchema = new Schema<IInclusions>({
  title: { type: String, required: true },
});

const exclusionsSchema = new Schema<IExclusions>({
  title: { type: String, required: true },
});

const citiesSchema = new Schema<ICities>({
  title: { type: String, required: true },
});
const importantNotesSchema = new Schema<IImportantNotes>({
  title: { type: String, required: true },
});

const detailedItinerarySchema = new Schema<IDetailedItinerary>({
  day: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const imageSchema = new Schema({
  cloudinary_id: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const tourSchema = new Schema<IPackage>({
  title: { type: String, required: true },
  about: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number,  },
  discountPercentage: { type: Number,  },
  isExclusive: { type: Boolean, default:false },
  highlights: { type: [highlightSchema], required: true },
  inclusions: { type: [inclusionsSchema], required: true },
  exclusions: { type: [exclusionsSchema], required: true },
  cities: { type: [citiesSchema], required: true },
  importantNotes: { type: [importantNotesSchema], required: true },
  detailedItinerary: { type: [detailedItinerarySchema], required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  country: { type: String, required: true },
  images: { type: [imageSchema], required: true },
});

const PackageModel = mongoose.model<IPackage>("Package", tourSchema);

export default PackageModel;
