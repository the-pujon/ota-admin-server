import { SortOrder } from "mongoose";
import AppError from "../../errors/AppError";
import {
  deleteImage,
  deleteLocalFile,
  uploadImage,
} from "../../utils/cloudinary_file_upload";
import { allCountry, searchableFields } from "./package.constant";
import { IPackage } from "./package.interface";
import PackageModel from "./package.model";
import { paginationCalculation } from "./package.utils";

const createPackage = async (
  payload: Partial<IPackage>,
  files: Express.Multer.File[]
): Promise<IPackage | null> => {
  console.log("Payload service: ", payload);
  console.log("files service: ", files);

  const { title } = payload;

  // Find the user by name ,if found it mean already hav this package so delete local path image
  if (files.length > 4 || files.length < 4) {
    for (const file of files) {
      try {
        // Delete local file
        deleteLocalFile(file.path);
      } catch (error) {
        throw new AppError(500, "Failed to delete image");
      }
    }
    throw new AppError(400, "do not support less than or equal 4 images");
  }

  // Find the user by name ,if found it mean already hav this package so delete local path image
  const countryName = await PackageModel.findOne({ title });
  if (countryName) {
    for (const file of files) {
      try {
        // Delete local file
        deleteLocalFile(file.path);
      } catch (error) {
        throw new AppError(500, "Failed to delete image");
      }
    }

    throw new AppError(404, "already upload this country image");
  }

  // Handle image uploads
  const uploadedImages: any[] = [];
  for (const file of files) {
    console.log("file.path", file.path);
    try {
      let cloudinaryFolder = `/TripNest_Packages/${title as string}`;
      // Upload image
      const result = await uploadImage(file.path, cloudinaryFolder);

      // Add image details to the images array
      uploadedImages.push({
        cloudinary_id: result.public_id,
        imageUrl: result.secure_url,
      });

      // Delete local file after upload
      deleteLocalFile(file.path);

      // Delete old image from Cloudinary if it exists
      //   if (user.images.length > 0) {
      //     await deleteImage(user.images[0].cloudinary_id); // Assuming single image handling
      //   }
    } catch (error) {
      throw new AppError(500, "Failed to upload image");
    }
  }

  console.log("uploadedImages services ... ", uploadedImages);

  // Prepare the updated user data
  const updatedData = {
    ...payload,
    images: uploadedImages.length > 0 ? uploadedImages : undefined, // Update avatars field with Cloudinary info
  };

  // Create new user if doesn't exist
  const newCountry = await PackageModel.create(updatedData);

  if (!newCountry) {
    throw new AppError(500, "Failed to create country");
  }

  return newCountry;
};

const allPackage = async (filters: any, payLoad: any) => {
  // for searching
  const { searchTerm, minPrice, maxPrice, ...filtersData } = filters;




  const andCondisons = [];
  // for searching based on country
  if (searchTerm===allCountry) {
    andCondisons.push({})
  }else{
    andCondisons.push({
      $or: searchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });

  }


  // for filtering
  if (Object.keys(filtersData).length) {
    andCondisons.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // for Price Range
  if (minPrice && maxPrice) {
    andCondisons.push({
      price: { $gte: minPrice, $lte: maxPrice },
    });
  }

  if (Object.keys(filtersData).length) {
    andCondisons.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
  paginationCalculation(payLoad);

  // for sorting
  const sortConditions: Record<string, SortOrder> = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }
  // End sorting

  const whereConditions = andCondisons.length > 0 ? { $and: andCondisons } : {};

  const tours = await PackageModel.find(whereConditions)
    // .populate('country', 'name -_id')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);
  const total = await PackageModel.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: tours,
  };
};

const getPackageByCountryAndTitle = async (country: string,title: string) => {

  const Package = await PackageModel.findOne({ country, title });
  if (!Package) {
    throw new AppError(500, "Failed to get Package By Country And Title");
  }

  return {
    data: Package,
  };
};



export const packageService = {
  createPackage,
  allPackage,
  getPackageByCountryAndTitle
};
