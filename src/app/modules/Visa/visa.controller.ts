import { Request, Response } from 'express';
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VisaServices } from "./visa.service";
import { VisaCountry } from "./visaCountry.model";
import VisaCountryRequirement from "./visaCountryRequirement.model";
import { MulterFile } from './visa.interface';
import { v2 as cloudinary } from 'cloudinary';

const cloudinaryUpload = async (file: MulterFile): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'country-images', 
    });
    return result.secure_url;  
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Cloudinary upload failed');
  }
};



const parseDocumentsFromBody = (body: any, documentType: string) => {
  const documents = [];
  let index = 0;
  
  while (body[`${documentType}[${index}].title`]) {
    const title = body[`${documentType}[${index}].title`];
    const details = [];

    let detailIndex = 0;
    while (body[`${documentType}[${index}].details[${detailIndex}]`]) {
      details.push(body[`${documentType}[${index}].details[${detailIndex}]`]);
      detailIndex++;
    }

    documents.push({
      title,
      details,
    });

    index++;
  }

  return documents;
};

const addVisaInfo = catchAsync(async (req: Request, res: Response) => {
  const visaInfos = req.body;
  console.log(visaInfos, "body");

  const files = req.files as MulterFile[] || [];
  

  console.log(files, "files")
  

  const images = files.filter(file => file.fieldname === 'images').map(file => file.path);
  
  const locationImages = files.filter(file => file.fieldname === 'locationImages').map(file => ({
    image: file.path,
    location: req.body[`location_${file.originalname}`],
  }));

  const documentTypes = ['general_documents', 'business_person', 'student', 'job_holder', 'other_documents'];
  
  const documents = await Promise.all(documentTypes.map(async (type) => {
    const documentsArray = JSON.parse(visaInfos[type] || '[]');
    
    const documentPromises = documentsArray.map(async (doc:any, index:any) => {
      const iconFieldName = `${type}[${index}].icon`;
      const iconFile = files.find(file => file.fieldname === iconFieldName);
      const uploadedIconUrl = iconFile ? await cloudinaryUpload(iconFile) : doc.icon;
      return {
        title: doc.title,
        details: doc.details,
        icon: uploadedIconUrl,
      };
    });
    
    return { [type]: await Promise.all(documentPromises) };
  }));

  const visaCountryRequirementData = documentTypes.reduce((acc:any, type:any, index:any) => {
    acc[type] = documents[index][type];
    return acc;
  }, {});
  try {
    const newVisaInfo = await VisaServices.addVisaInfo({
      ...visaInfos,
      files,
      images,
      locationImages,
      ...visaCountryRequirementData,
    }, files);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Visa Info Created Successfully",
      data: newVisaInfo,
    });
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error adding visa info:', error.message);
      return res.status(500).json({
        message: 'Error adding visa info',
        error: error.message,
      });
    } else {
      console.error('An unknown error occurred:', error);
      return res.status(500).json({
        message: 'Unknown error occurred',
      });
    }
  }
});


const updateVisaInfo = catchAsync(async (req: Request, res: Response) => {
 
  const { countryName } = req.params;
  const updatedVisaInfo = req.body;
  // console.log("updatedVisaInfo: ",updatedVisaInfo)
  // return;
  const files = (req.files as MulterFile[]) || [];
 
  const images = files
    ?.filter((file) => file.fieldname.startsWith('images'))
    .map((file) => file.path) || [];
 
  const locationImages: any = files
    ?.filter((file) => file.fieldname.startsWith('locationImages'))
    .map((file) => {
      const match = file.fieldname.match(/locationImages\[(\d+)\].image/);
      const index = match ? match[1] : null;
 
      const location = index ? req.body[`locationImages[${index}].location`] : '';
 
      return {
        image: file.path,
        location,
      };
    }) || [];
 
  const documentTypes = ['general_documents', 'business_person', 'student', 'job_holder', 'other_documents'];
 
  const documents = await Promise.all(
    documentTypes.map(async (type) => {
      const documentsArray = parseDocumentsFromBody(updatedVisaInfo, type);
 
      const documentPromises = documentsArray.map(async (doc: any, index: any) => {
        const iconFieldName = `${type}[${index}].icon`;
        const iconFile = files.find((file) => file.fieldname === iconFieldName);
 
        const uploadedIconUrl = iconFile ? await cloudinaryUpload(iconFile) : doc.icon;
 
        return {
          title: doc.title,
          details: doc.details,
          icon: uploadedIconUrl,
        };
      });
 
      return { [type]: await Promise.all(documentPromises) };
    })
  );
 
  const visaCountryRequirementData = documentTypes.reduce((acc: any, type: any, index: any) => {
    acc[type] = documents[index][type];
    return acc;
  }, {});
 
 
  const notes = Object.keys(req.body)
  .filter((key) => key.startsWith('note['))
  .sort()
  .map((key) => ({ text: req.body[key].trim() })) 
  .filter((note) => note.text);
 
 
 
  try {
    const updatedVisa = await VisaServices.updateVisaInfo({
      countryName,
      ...updatedVisaInfo,
      ...visaCountryRequirementData,
      note: notes,
      images,
      locationImages,
    });
 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Visa Info Updated Successfully',
      data: updatedVisa,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating visa info:', error.message);
      return res.status(500).json({
        message: 'Error updating visa info',
        error: error.message,
      });
    } else {
      console.error('An unknown error occurred:', error);
      return res.status(500).json({
        message: 'Unknown error occurred',
      });
    }
  }
});

const deleteVisaInfo = catchAsync(async (req: Request, res: Response) => {
  const { countryName } = req.params;

  try {
    const result = await VisaServices.deleteVisaInfo(countryName);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Visa Info Deleted Successfully",
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting visa info:', error.message);
      return res.status(500).json({
        message: 'Error deleting visa info',
        error: error.message,
      });
    } else {
      console.error('An unknown error occurred:', error);
      return res.status(500).json({
        message: 'Unknown error occurred',
      });
    }
  }
});


const getAllCountriesData = catchAsync(async (req, res) => {
  try {
    const visaCountries = await VisaCountry.find();

    if (!visaCountries || visaCountries.length === 0) {
      return res.status(404).json({ message: 'No visa information found' });
    }

    const visaDataWithRequirements = await Promise.all(
      visaCountries.map(async (country) => {
        const visaRequirements = await VisaCountryRequirement.findOne({ visaCountryId: country._id });
        return {
          visaInfo: country,
          visaRequirements: visaRequirements || {}
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: visaDataWithRequirements,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching all visa data:', error.message);
      return res.status(500).json({
        message: 'Error fetching all visa data',
        error: error.message,
      });
    } else {
      console.error('An unknown error occurred:', error);
      return res.status(500).json({
        message: 'Unknown error occurred',
      });
    }
  }
});


const getVisaInfoByCountry = catchAsync(async (req, res) => {
  const { countryName } = req.params;

  try {
    const visaInfo = await VisaCountry.findOne({ countryName });
    
    if (!visaInfo) {
      return res.status(404).json({ message: 'Visa information not found for this country' });
    }

    const visaRequirements = await VisaCountryRequirement.findOne({ visaCountryId: visaInfo._id });

    const result = {
      visaInfo,
      visaRequirements: visaRequirements || {}
    };

    return res.status(200).json({
      success: true,
      data: result
    });

} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error fetching visa information', error.message);
    return res.status(500).json({
      message: 'Error fetching visa information',
      error: error.message,
    });
  } else {
    console.error('An unknown error occurred:', error);
    return res.status(500).json({
      message: 'Unknown error occurred',
    });
  }
}
});



const getAllCountries = catchAsync(async (req, res) => {
  try {
    const countryNames = await VisaCountry.find({}, 'countryName');

    if (!countryNames || countryNames.length === 0) {
      return res.status(404).json({ message: 'No countries found' });
    }

    const result = {
      countryNames,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching country names', error.message);
      return res.status(500).json({
        message: 'Error fetching country names',
        error: error.message,
      });
    } else {
      console.error('An unknown error occurred:', error);
      return res.status(500).json({
        message: 'Unknown error occurred',
      });
    }
  }
});

export async function deleteMedia(req: Request, res: Response) {
  const { countryId, mediaType, publicId, documentCategory, documentTitle } = req.body;

  console.log("Request received:", req.body);

  if (!countryId || !mediaType || !publicId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validMediaTypes = ['images', 'locationImages', 'documentIcon'];
  if (!validMediaTypes.includes(mediaType)) {
    return res.status(400).json({ error: 'Invalid media type' });
  }

  try {
    await VisaServices.deleteCountryMedia(countryId, mediaType, publicId, documentCategory, documentTitle);
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    res.status(500).json({ error: `Failed to delete media: ${error.message}` });
  }
}

// getting single country info for displaying on checklist modal
const getVisaInfoById = catchAsync(async (req, res) => {

  const { visaCountryId } = req.params;


  console.log("controller Id ",visaCountryId)

  const visaInfo = await VisaCountryRequirement.findOne({visaCountryId });
  console.log("visa info")

  if (!visaInfo) {
    return res
      .status(404)
      .json({ message: "Visa information not found for this country" });
  }

  return res.status(200).json({
    success: true,
    data: visaInfo,
  });
});


export const VisaControllers = {
  addVisaInfo,
  getVisaInfoByCountry,
  updateVisaInfo,
  getAllCountriesData,
  getAllCountries,
  deleteVisaInfo,
  deleteMedia,
  getVisaInfoById,
};
