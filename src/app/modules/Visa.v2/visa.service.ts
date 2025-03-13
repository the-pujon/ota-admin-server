import { Request } from 'express';
import mongoose from 'mongoose';
// import { VisaCountry, VisaCountryRequirement } from './visa.model';
import { v4 as uuidv4 } from 'uuid'; 
import { prepareDocuments, prepareDocumentsForUpdate } from './visa.utils';
import { VisaCountry, VisaCountryRequirement } from './visa.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { cacheData, getCachedData } from '../../utils/redis.utils';
import config from '../../config';
import { deleteCloudinaryImages } from '../../utils/cloudinaryDelete';


/**
 * Prepares and saves visa data based on frontend submission
 * @param req Express request object containing form data and files
 * @returns Object containing the saved VisaCountry and VisaCountryRequirement documents
 */
 const addVisaService = async (req: Request) => {
  const visaData = req.body;
  const files: any = req.files;
  
  
  // Generate a custom ID if not provided
  const customId = `CUST-${uuidv4()}`;
  
  // 1. Prepare data for VisaCountry model
  const visaCountryData = {
    countryName: visaData.countryName,
    visaType: visaData.visaType,
    customId: customId,
    title: visaData.title,
    subtitle: visaData.subtitle,
    description: visaData.description,
    capital: visaData.capital,
    time: visaData.time,
    telephone_code: visaData.telephone_code,
    bank_time: visaData.bank_time,
    embassy_address: visaData.embassy_address,
    visaPrice_mainText: visaData.visaPrice_mainText,
    visaPrice_price: visaData.visaPrice_price,
    visaPrice_note: visaData.visaPrice_note,
   
    images: files
      ?.filter((file: any) => file.fieldname.startsWith('images['))
      .map((file: any) => file.path), // Extract image paths from the files array
    note: visaData.notes ? visaData.notes.map((note: any) => ({ text: note.text })) : [], // Format notes
    locationImages: visaData.locationImages ? visaData.locationImages.map((item: any, index: number) => {
      const locationFile = files.find((file: any) => file.fieldname === `locationImages[${index}]`);
      return {
        image: locationFile?.path || '',
        location: item.location,
      };
    }) : []// Format location images with their descriptions
  };

  // console.log("visaCountryData:::::::::::", visaCountryData, "::::::::::::visaCountryData");
  
  // 2. Create and save the VisaCountry document
  const savedVisaCountry = await VisaCountry.create(visaCountryData);
  
  // 3. Prepare data for VisaCountryRequirement model
  const requirementData = {
    visaCountryId: savedVisaCountry._id,
    general_documents: prepareDocuments(visaData.general_documents, files, 'general_documentsIcons'),// Process general documents
    business_person: prepareDocuments(visaData.business_person, files, 'business_personIcons'),    // Process business person documents
    student: prepareDocuments(visaData.student, files, 'studentIcons'),    // Process student documents
    job_holder: prepareDocuments(visaData.job_holder, files, 'job_holderIcons'),    // Process job holder documents
    other_documents: prepareDocuments(visaData.other_documents, files, 'other_documentsIcons')    // Process other documents (optional)
  };


  // console.log("requirementData:::::::::::", requirementData, "::::::::::::requirementData");
  
  // 4. Create and save the VisaCountryRequirement document
  const savedRequirement = await VisaCountryRequirement.create(requirementData);
  
  return {
    visaCountry: savedVisaCountry,
    visaRequirement: savedRequirement
    // visaCountry: null,
    // visaRequirement: null
  };
};



const deleteVisaService = async (countryName: string) => {
  try {
    const visaInfo = await VisaCountry.findOne({ countryName });

    if (!visaInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Visa information not found');
    }

    await VisaCountry.deleteOne({ countryName });
    await VisaCountryRequirement.deleteOne({ visaCountryId: visaInfo._id });

    return { message: `Visa information for ${countryName} deleted successfully` };
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Error deleting visa information: ' + error);
  }
};

const getAllVisaInfoService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [visaInfo, total] = await Promise.all([
    VisaCountry.find().skip(skip).limit(limit),
    VisaCountry.countDocuments(),
  ]);


  return {
    data: visaInfo,
    meta: {
      total: total,
      totalPage: Math.ceil(total / limit),
      page: page,
      limit: limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Retrieves visa information for a specific country.
 * @param countryName The country name whose visa information is being retrieved
 * @returns Object containing the VisaCountry and VisaCountryRequirement documents
 */
const getVisaInfoByCountryService = async (countryName: string) => {
  // Find the VisaCountry document by countryName
  const visaInfo = await VisaCountry.findOne({ countryName });
      
  if (!visaInfo) {
    throw new Error('Visa information not found for this country');
  }

  // Convert the ObjectId to a string since visaCountryId is stored as string
  const id = visaInfo._id.toString();
  
  // Find the VisaCountryRequirement and populate the visaCountryId field
  const visaRequirements = await VisaCountryRequirement.findOne({ visaCountryId: id })
    .populate({
      path: 'visaCountryId',
      model: 'VisaCountry'
    });
  
  // console.log("Visa Country ID:", id);
  // console.log("Found requirements with populated data:", visaRequirements!.general_documents);
  
  // Return both pieces of information
  return visaRequirements;
};

 
  /**
   * Updates visa information for a specific country.
   * @param countryName The country name whose visa information is being updated
   * @param req Express request object containing updated data and files
   * @returns Object containing the updated VisaCountry and VisaCountryRequirement documents
   */
  const updateVisaInfoByCountryService = async (countryName: string, req: Request) => {
    const visaData = req.body;
    const files: any = req.files;

    // console.log("visaData.images", visaData.images);

    // return visaData

    // console.log(countryName)
  
    // 1. Find existing VisaCountry document by countryName
    const existingVisaCountry = await VisaCountry.findOne({ countryName: countryName});

    // console.log(existingVisaCountry)
    if (!existingVisaCountry) {
      throw new AppError(httpStatus.NOT_FOUND, 'Visa country information not found');
    }


    
  // Get existing images from DB
  const existingImages = existingVisaCountry.images || [];
  const existingLocationImages = existingVisaCountry.locationImages || [];

  // Get updated images from frontend request
  const updatedImages = visaData.images || [];
  const updatedLocationImages = visaData.locationImages || [];

  // Identify deleted images (DB images not present in updated request)
  const deletedImages = existingImages.filter(img => !updatedImages.includes(img));

  // Identify deleted location images
  const deletedLocationImages = existingLocationImages.filter(
    locImg => !updatedLocationImages.some((item: any) => item.image === locImg.image)
  );


  try {
    const allImagesToDelete = [...deletedImages, ...deletedLocationImages];
    if (allImagesToDelete.length > 0) {
      const deletionResults = await deleteCloudinaryImages(allImagesToDelete);
      // console.log('Cloudinary deletion results:', deletionResults);
    }
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    // You can decide whether to throw an error here or continue
  }

  
    // 2. Prepare the updated data for the VisaCountry model
    const visaCountryData = {
      countryName: visaData.countryName || existingVisaCountry.countryName,
      visaType: visaData.visaType || existingVisaCountry.visaType,
      customId: existingVisaCountry.customId, // Retain the existing customId
      title: visaData.title || existingVisaCountry.title,
      subtitle: visaData.subtitle || existingVisaCountry.subtitle,
      description: visaData.description || existingVisaCountry.description,
      capital: visaData.capital || existingVisaCountry.capital,
      time: visaData.time || existingVisaCountry.time,
      telephone_code: visaData.telephone_code || existingVisaCountry.telephone_code,
      bank_time: visaData.bank_time || existingVisaCountry.bank_time,
      embassy_address: visaData.embassy_address || existingVisaCountry.embassy_address,
      visaPrice_mainText: visaData.visaPrice_mainText || existingVisaCountry.visaPrice_mainText,
      visaPrice_price: visaData.visaPrice_price || existingVisaCountry.visaPrice_price,
      visaPrice_note: visaData.visaPrice_note || existingVisaCountry.visaPrice_note,
      images: [
        ...visaData.images,
        ...(files?.filter((file: any) => file.fieldname.startsWith('images['))
          .map((file: any) => file.path) || [])
      ],
  
      note: visaData.notes ? visaData.notes.map((note: any) => ({ text: note.text })) : existingVisaCountry.note,
  
      locationImages: visaData.locationImages ? visaData.locationImages.map((item: any, index: number) => {
        const locationFile = files.find((file: any) => file.fieldname === `locationImages[${index}]`);
        return {
          image: locationFile?.path || existingVisaCountry.locationImages[index]?.image,
          location: item.location || existingVisaCountry.locationImages[index]?.location,
        };
      }) : existingVisaCountry.locationImages,
    };
  
    // 3. Update the VisaCountry document
    const updatedVisaCountry = await VisaCountry.findByIdAndUpdate(
      existingVisaCountry._id,
      visaCountryData,
      { new: true }
    );
  
    // 4. Find existing VisaCountryRequirement document by visaCountryId
    const existingVisaRequirement = await VisaCountryRequirement.findOne({ visaCountryId: updatedVisaCountry!._id });
    if (!existingVisaRequirement) {
      throw new AppError(httpStatus.NOT_FOUND, 'Visa country requirement information not found');
    }

    // console.log(files)
  
    // 5. Prepare the updated data for the VisaCountryRequirement model
    const requirementData = {
      visaCountryId: updatedVisaCountry!._id,
      general_documents: prepareDocumentsForUpdate(visaData.general_documents, files, 'general_documentsIcons', existingVisaRequirement.general_documents),
      business_person: prepareDocumentsForUpdate(visaData.business_person, files, 'business_personIcons', existingVisaRequirement.business_person),
      student: prepareDocumentsForUpdate(visaData.student, files, 'studentIcons', existingVisaRequirement.student),
      job_holder: prepareDocumentsForUpdate(visaData.job_holder, files, 'job_holderIcons', existingVisaRequirement.job_holder),
      other_documents: prepareDocumentsForUpdate(visaData.other_documents, files, 'other_documentsIcons', existingVisaRequirement.other_documents),
    };
  
    // 6. Update the VisaCountryRequirement document
    const updatedVisaRequirement = await VisaCountryRequirement.findByIdAndUpdate(
      existingVisaRequirement._id,
      requirementData,
      { new: true }
    );
  
    return {
      visaCountry: updatedVisaCountry,
      visaRequirement: updatedVisaRequirement,
      deletedImages,
      deletedLocationImages,
    };
  };
  
  export default updateVisaInfoByCountryService;
  





//   const updateVisaInfoByCountryService = async (countryName: string, req: Request) => {
//     const visaData = req.body;
//     const files: any = req.files;

//     console.log(countryName);
  
//     // 1. Find existing VisaCountry document by countryName
//     const existingVisaCountry = await VisaCountry.findOne({ countryName });

//     console.log(existingVisaCountry);
//     if (!existingVisaCountry) {
//         throw new AppError(httpStatus.NOT_FOUND, 'Visa country information not found');
//     }

//     // Extract existing images
//     const existingImages = [...existingVisaCountry.images];
//     const existingLocationImages = [...existingVisaCountry.locationImages];

//     // Arrays to store replaced image URLs
//     const replacedImageUrls: string[] = [];
//     const replacedLocationImageUrls: string[] = [];

//     // Update main images by replacing specific indexes
//     const updatedImages = existingImages.map((img, index) => {
//         const uploadedFile = files.find((file: any) => file.fieldname === `images[${index}]`);
//         if (uploadedFile) {
//             replacedImageUrls.push(img); // Store old URL
//             return uploadedFile.path; // Replace with new file path
//         }
//         return img; // Keep existing image if not replaced
//     });

//     // Append new images (if any)
//     const newImages = files
//         ?.filter((file: any) => file.fieldname.startsWith('images['))
//         .map((file: any) => file.path) || [];

//     const finalImages = [...updatedImages, ...newImages];

//     // Update location images by replacing specific indexes
//     const updatedLocationImages = existingLocationImages.map((item, index) => {
//         const uploadedFile = files.find((file: any) => file.fieldname === `locationImages[${index}]`);
//         if (uploadedFile) {
//             replacedLocationImageUrls.push(item.image); // Store old URL
//             return {
//                 image: uploadedFile.path, // Replace with new file path
//                 location: visaData.locationImages?.[index]?.location || item.location, // Preserve location data
//             };
//         }
//         return item; // Keep existing location image if not replaced
//     });

//     // Append new location images (if any)
//     const newLocationImages = (visaData.locationImages || []).map((item: any, index: number) => {
//         const uploadedFile = files.find((file: any) => file.fieldname === `locationImages[${index}]`);
//         return {
//             image: uploadedFile?.path || item.image,
//             location: item.location || '',
//         };
//     });

//     const finalLocationImages = [...updatedLocationImages, ...newLocationImages];

//     // 2. Prepare the updated data for the VisaCountry model
//     const visaCountryData = {
//         countryName: visaData.countryName || existingVisaCountry.countryName,
//         visaType: visaData.visaType || existingVisaCountry.visaType,
//         customId: existingVisaCountry.customId, // Retain the existing customId
//         title: visaData.title || existingVisaCountry.title,
//         subtitle: visaData.subtitle || existingVisaCountry.subtitle,
//         description: visaData.description || existingVisaCountry.description,
//         capital: visaData.capital || existingVisaCountry.capital,
//         time: visaData.time || existingVisaCountry.time,
//         telephone_code: visaData.telephone_code || existingVisaCountry.telephone_code,
//         bank_time: visaData.bank_time || existingVisaCountry.bank_time,
//         embassy_address: visaData.embassy_address || existingVisaCountry.embassy_address,
//         visaPrice_mainText: visaData.visaPrice_mainText || existingVisaCountry.visaPrice_mainText,
//         visaPrice_price: visaData.visaPrice_price || existingVisaCountry.visaPrice_price,
//         visaPrice_note: visaData.visaPrice_note || existingVisaCountry.visaPrice_note,
//         images: finalImages, // Updated images
//         note: visaData.notes ? visaData.notes.map((note: any) => ({ text: note.text })) : existingVisaCountry.note,
//         locationImages: finalLocationImages, // Updated location images
//     };

//     // 3. Update the VisaCountry document
//     const updatedVisaCountry = await VisaCountry.findByIdAndUpdate(
//         existingVisaCountry._id,
//         visaCountryData,
//         { new: true }
//     );

//     // 4. Find existing VisaCountryRequirement document by visaCountryId
//     const existingVisaRequirement = await VisaCountryRequirement.findOne({ visaCountryId: updatedVisaCountry!._id });
//     if (!existingVisaRequirement) {
//         throw new AppError(httpStatus.NOT_FOUND, 'Visa country requirement information not found');
//     }

//     // 5. Prepare the updated data for the VisaCountryRequirement model
//     const requirementData = {
//         visaCountryId: updatedVisaCountry!._id,
//         general_documents: prepareDocumentsForUpdate(visaData.general_documents, files, 'general_documentsIcons', existingVisaRequirement.general_documents),
//         business_person: prepareDocumentsForUpdate(visaData.business_person, files, 'business_personIcons', existingVisaRequirement.business_person),
//         student: prepareDocumentsForUpdate(visaData.student, files, 'studentIcons', existingVisaRequirement.student),
//         job_holder: prepareDocumentsForUpdate(visaData.job_holder, files, 'job_holderIcons', existingVisaRequirement.job_holder),
//         other_documents: prepareDocumentsForUpdate(visaData.other_documents, files, 'other_documentsIcons', existingVisaRequirement.other_documents),
//     };

//     // 6. Update the VisaCountryRequirement document
//     const updatedVisaRequirement = await VisaCountryRequirement.findByIdAndUpdate(
//         existingVisaRequirement._id,
//         requirementData,
//         { new: true }
//     );

//     return {
//         visaCountry: updatedVisaCountry,
//         visaRequirement: updatedVisaRequirement,
//         replacedImageUrls, // Return replaced image URLs for reference
//         replacedLocationImageUrls, // Return replaced location image URLs for reference
//     };
// };




// const updateVisaInfoByCountryService = async (countryName: string, req: Request) => {
//   const visaData = req.body;
//   const files: any = req.files;

//   // 1. Find existing VisaCountry document by countryName
//   const existingVisaCountry = await VisaCountry.findOne({ countryName });

//   if (!existingVisaCountry) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Visa country information not found');
//   }

//   // Get existing images from DB
//   const existingImages = existingVisaCountry.images || [];
//   const existingLocationImages = existingVisaCountry.locationImages || [];

//   // Get updated images from frontend request
//   const updatedImages = visaData.images || [];
//   const updatedLocationImages = visaData.locationImages || [];

//   // Identify deleted images (DB images not present in updated request)
//   const deletedImages = existingImages.filter(img => !updatedImages.includes(img));

//   // Identify deleted location images
//   const deletedLocationImages = existingLocationImages.filter(
//     locImg => !updatedLocationImages.some((item: any) => item.image === locImg.image)
//   );

//   // Prepare updated images list (include new ones from files)
//   const newUploadedImages = files?.filter((file: any) => file.fieldname.startsWith('images['))
//     .map((file: any) => file.path) || [];

//   // Final images array (keep existing, remove deleted, add new)
//   const finalImages = [...updatedImages, ...newUploadedImages];

//   // Prepare updated location images
//   const finalLocationImages = updatedLocationImages.map((item: any, index: number) => {
//     const locationFile = files.find((file: any) => file.fieldname === `locationImages[${index}]`);
//     return {
//       image: locationFile?.path || item.image,
//       location: item.location
//     };
//   });

//   // // Update VisaCountry document
//   // const visaCountryData = {
//   //   ...existingVisaCountry.toObject(),
//   //   images: finalImages,
//   //   locationImages: finalLocationImages
//   // };

//   // const updatedVisaCountry = await VisaCountry.findByIdAndUpdate(
//   //   existingVisaCountry._id,
//   //   visaCountryData,
//   //   { new: true }
//   // );

//   return {
//     // visaCountry: updatedVisaCountry,
//     deletedImages,
//     deletedLocationImages,
//     finalImages,
//     finalLocationImages
//   };
// };

 export const getAllCountryNameFromAllVisaService = async()=>{

      const cachedData = await getCachedData(`${config.redis_cache_key_prefix}: visaCountryNames`);

      if(cachedData){
        return cachedData
      }
      const countryName = await VisaCountry.find({}, 'countryName');
      const result = {
        countryName,
      };

       await cacheData(
         `${config.redis_cache_key_prefix}:visaCountryNames`,
         countryName,
         3600 * 10,
       );
  return result
}

export const VisaServices = {
    addVisaService,
    deleteVisaService,
    getAllVisaInfoService,
    getVisaInfoByCountryService,
    updateVisaInfoByCountryService,
    getAllCountryNameFromAllVisaService
}