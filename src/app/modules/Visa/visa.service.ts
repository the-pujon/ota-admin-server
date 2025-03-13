import { IVisaCountry, IVisaCountryRequirement, MulterFile } from './visa.interface';
import { VisaCountry } from './visaCountry.model';
import { VisaCountryRequirement } from './visaCountryRequirement.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid'; 
import { v2 as cloudinary } from 'cloudinary';

const parseDocuments = (documentField: any) => {
  const documents = Array.isArray(documentField) ? documentField : JSON.parse(documentField || '[]');
  
  return documents.map((doc: any) => ({
    ...doc,
    icon: typeof doc.icon === 'string' ? doc.icon : ''
  }));
};

const addVisaInfo = async (payload: IVisaCountry & IVisaCountryRequirement, files: MulterFile[]) => {
  const {
    countryName,
    visaType,
    title,
    subtitle,
    description,
    images,
    locationImages,
    capital,
    time,
    telephone_code,
    bank_time,
    embassy_address,
    note,
    general_documents,
    business_person,
    student,
    job_holder,
    other_documents,
    visaPrice_mainText,
    visaPrice_price,
    visaPrice_note,
  } = payload;

  const customId = `CUST-${uuidv4()}`;

  try {
    const newVisaInfo = await VisaCountry.create({
      countryName,
      customId,
      visaType,
      title,
      subtitle,
      description,
      images,
      locationImages,
      capital,
      time,
      telephone_code,
      bank_time,
      embassy_address,
      note,
      visaPrice_mainText,
      visaPrice_price,
      visaPrice_note,
    });

    const parsedGeneralDocuments = await parseDocuments(general_documents);
    const parsedBusinessPerson = await parseDocuments(business_person);
    const parsedStudent = await parseDocuments(student);
    const parsedJobHolder = await parseDocuments(job_holder);
    const parsedOtherDocuments = await parseDocuments(other_documents);

    const newVisaRequirement = await VisaCountryRequirement.create({
      visaCountryId: newVisaInfo._id, 
      general_documents: parsedGeneralDocuments,
      business_person: parsedBusinessPerson,
      student: parsedStudent,
      job_holder: parsedJobHolder,
      other_documents: parsedOtherDocuments,
    });

    return {
      newVisaInfo,
      newVisaRequirement,
    };
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Error adding visa information: ' + error);
  }
};


const parseDocumentsWithExistingIcons = (newDocuments: any, existingDocuments: any) => {
 
  const existingIconsMap = existingDocuments.reduce((map: any, doc: any) => {
    map = doc.icon; 
    return map;
  }, {});
 
  const documents = Array.isArray(newDocuments) ? newDocuments : JSON.parse(newDocuments || '[]');
 
  return documents.map((doc: any) => {
    const existingIcon = existingIconsMap;
 
    return {
      ...doc,
      icon: doc.icon !== undefined && doc.icon !== null && doc.icon.trim() !== '' 
        ? doc.icon
        : existingIcon,
    };
  });
};

const updateVisaInfo = async (payload: IVisaCountry & IVisaCountryRequirement) => {
  const { images, locationImages, countryName, note, ...updateFields } = payload;
 
  try {
    const existingVisaInfo = await VisaCountry.findOne({ countryName });
 
    if (!existingVisaInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Visa information not found');
    }
 
    const updatedImages = [...existingVisaInfo.images, ...(images || [])];
    const updatedLocationImages = [...existingVisaInfo.locationImages, ...(locationImages || [])];
 
 
    const existingNotesMap = new Map(existingVisaInfo.note.map((note:any) => [note._id?.toString(), note]));
    const updatedNotes = note.map((newNote:any) => {
      if (newNote._id && existingNotesMap.has(newNote._id.toString())) {
        return { ...existingNotesMap.get(newNote._id.toString()), text: newNote.text };
      } else {
        return newNote;
      }
    });
 
    const updatedData = {
      ...updateFields,
      locationImages: updatedLocationImages,
      images: updatedImages,
      note:updatedNotes
    };
 
 
    const updatedVisaInfo = await VisaCountry.findByIdAndUpdate(existingVisaInfo._id, updatedData, { new: true });
 
    if (!updatedVisaInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Visa information not updated');
    }
 
    const existingVisaRequirement = await VisaCountryRequirement.findOne({ visaCountryId: existingVisaInfo._id });
 
    if (!existingVisaRequirement) {
      throw new AppError(httpStatus.NOT_FOUND, 'Visa requirements not found for update');
    }
 
    const parsedGeneralDocuments = parseDocumentsWithExistingIcons(updateFields.general_documents, existingVisaRequirement.general_documents);
    const parsedBusinessPerson = parseDocumentsWithExistingIcons(updateFields.business_person, existingVisaRequirement.business_person);
    const parsedStudent = parseDocumentsWithExistingIcons(updateFields.student, existingVisaRequirement.student);
    const parsedJobHolder = parseDocumentsWithExistingIcons(updateFields.job_holder, existingVisaRequirement.job_holder);
    const parsedOtherDocuments = parseDocumentsWithExistingIcons(updateFields.other_documents, existingVisaRequirement.other_documents);
 
    const updatedVisaRequirement = await VisaCountryRequirement.findOneAndUpdate(
      { visaCountryId: existingVisaInfo._id },
      {
        general_documents: parsedGeneralDocuments,
        business_person: parsedBusinessPerson,
        student: parsedStudent,
        job_holder: parsedJobHolder,
        other_documents: parsedOtherDocuments,
      },
      { new: true }
    );
 
    return {
      updatedVisaInfo,
      updatedVisaRequirement,
    };
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Error updating visa information: ' + error);
  }
};


const deleteVisaInfo = async (countryName: string) => {
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

async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

async function deleteCountryMedia(
  countryId: string,
  mediaType: 'images' | 'locationImages' | 'documentIcon',
  publicId: string,
  documentCategory?: 'general_documents' | 'business_person' | 'student' | 'job_holder' | 'other_documents',
  documentTitle?: string
): Promise<void> {
  try {
    await deleteFromCloudinary(publicId);

    let updateResult;

    switch (mediaType) {
      case 'images':
        updateResult = await VisaCountry.updateOne(
          { _id: countryId },
          { $pull: { images: publicId } } 
        );
        break;

      case 'locationImages':
        updateResult = await VisaCountry.updateOne(
          { _id: countryId },
          { $pull: { locationImages: { image: publicId } } }  // Match by image URL
        );
        break;

      case 'documentIcon':
        if (!documentCategory || !documentTitle) {
          throw new Error("documentCategory and documentTitle are required for documentIcon deletion.");
        }
        updateResult = await VisaCountryRequirement.updateOne(
          { visaCountryId: countryId, [`${documentCategory}.title`]: documentTitle },
          { $unset: { [`${documentCategory}.$.icon`]: '' } }
        );
        break;

      default:
        throw new Error("Invalid media type specified.");
    }

    if (updateResult.modifiedCount === 0) {
      throw new Error("Visa information not found or already deleted.");
    }

  } catch (error: any) {
    console.error(`Error deleting media: ${error.message}`);
    throw new Error(`Error deleting media from Cloudinary or database: ${error.message}`);
  }
}


export const VisaServices = {
  addVisaInfo,
  updateVisaInfo,
  deleteVisaInfo, 
  deleteCountryMedia
};