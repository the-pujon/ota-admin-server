import mongoose, { Schema, Document, SortOrder } from 'mongoose';

export interface IHighlight {
  title: string;
  description: string;
}
export interface IInclusions {
  title: string;
}

export interface IExclusions {
  title: string;
}

export interface ICities {
  title: string;
}

export interface IImportantNotes {
  title: string;
}

export interface IDetailedItinerary {
  day: string;
  title: string;
  description: string;
}

export interface IPackage extends Document {
  title: string;
  about: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  isExclusive:boolean;
  highlights: IHighlight[];
  inclusions: IInclusions[];
  exclusions: IExclusions[];
  cities: ICities[];
  importantNotes: IImportantNotes[];
  detailedItinerary: IDetailedItinerary[];
  category: string;
  duration: string;
  country: string;
  images: {
    cloudinary_id: string;
    imageUrl: string;
  }[];
}

// for getting all package

// export type TourModelType = Model<ITour, Record<string, unknown>>;

export interface IPackageFilters {
	searchTerm?: string;
	minPrice?: number;
	maxPrice?: number;
}

// for pagination
export type IOptions = {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: SortOrder;
};

export type IOptionsResult = {
	page: number;
	limit: number;
	skip: number;
	sortBy: string;
	sortOrder: SortOrder;
};

