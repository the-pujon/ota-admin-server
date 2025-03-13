import { Request, Response } from 'express';
import { TravelerModelBig } from './vb.model';
import { ITraveler, IDocument, ISubTraveler } from './vb.interface';
import cloudinary from '../../utils/cloudinary';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { getEmailTemplate, sendEmail } from '../../utils/sendEmail';
 
export const createTraveler = catchAsync(async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
 
    const { firstName, lastName, phoneNumber, email, localAddress, specialNotes, visaType, passport_img, photo_img } = req.body;
 
    const travelerData: ITraveler = {
      firstName,
      lastName,
      phoneNumber,
      email,
      localAddress,
      specialNotes,
      visaType,
      Travelers: [],
    };
 
    const fieldsToUpload = [
      'passport_img',
      'photo_img',
      'bankStatement_pdf',
      'bankSolvencyCertificate',
      'visitingCard',
      'hotelBooking',
      'airTicket',
      'jobDocument',
      'studentDocument',
      'businessPersonDocument',
      'otherDocument',
    ];
 
console.log('Traveler Data Before Saving:', travelerData);
 
console.log('Request Body:', req.body);
console.log('Uploaded Files:', req.files);
 
 
    console.log('Files keys:', Object.keys(files));
 
const uploadFileToCloudinary = async (filePath: string) => {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    folder: "tpn_visaBooking",
  });
};
 
const gatherFilesForArrayField = (fieldName: string) => {
  const filesArray = [];
  let index = 0;
  while (files[`${fieldName}[${index}]`]) {
    filesArray.push(files[`${fieldName}[${index}]`][0]);
    index++;
  }
  return filesArray;
};
 
 
const uploadAndSetField = async (fieldName: string, target: any) => {
  if (files[fieldName] && files[fieldName].length > 0) {
    const uploadResults = await Promise.all(
      files[fieldName].map(async (file) => {
        const result = await uploadFileToCloudinary(file.path);
        return { file: result.secure_url, cloudinary_id: result.public_id };
      })
    );
 
    if (Array.isArray(target[fieldName])) {
      target[fieldName].push(...uploadResults);
    } else {
      target[fieldName] = uploadResults[0]; 
    }
  }
};
 
 
for (const field of fieldsToUpload) {
  const filesToUpload = gatherFilesForArrayField(field);
 
  if (filesToUpload.length > 0) {
 
    (travelerData as any)[field] = [];
 
    for (const file of filesToUpload) {
      try {
        const result = await uploadFileToCloudinary(file.path);
        (travelerData as any)[field].push({ file: result.secure_url, cloudinary_id: result.public_id });
      } catch (uploadError) {
        console.error(`Error uploading file for field ${field}:`, uploadError);
      }
    }
  }
}
 
await Promise.all(fieldsToUpload.map(field => uploadAndSetField(field, travelerData)));
 
const parseNestedFields = (
  body: Record<string, any>,
  files: Record<string, any>,
  prefix: string
) => {
  const result: any[] = [];
  Object.keys(body).forEach((key) => {
    const match = key.match(new RegExp(`^${prefix}\\[(\\d+)]\\.(.+)$`));
    if (match) {
      const [_, index, fieldName] = match;
      const i = parseInt(index, 10);
      if (!result[i]) result[i] = {};
      result[i][fieldName] = body[key];
    }
  });
 
  Object.keys(files).forEach((key) => {
    const match = key.match(new RegExp(`^${prefix}\\[(\\d+)]\\.(.+)$`));
    if (match) {
      const [_, index, fieldName] = match;
      const i = parseInt(index, 10);
      if (!result[i]) result[i] = {};
 
      const baseFieldName = fieldName.split('[')[0];
      if (!Array.isArray(result[i][baseFieldName])) {
        result[i][baseFieldName] = [];
      }
      result[i][baseFieldName].push(
        ...files[key].map((file: Express.Multer.File) => ({
          file: file.path,
          cloudinary_id: null,
        }))
      );
    }
  });
 
  return result;
};
 
const travelers = parseNestedFields(req.body, files, "Travelers");
 
for (let i = 0; i < travelers.length; i++) {
  const subTraveler = travelers[i];
 
  for (const field of fieldsToUpload) {
    if (subTraveler[field]) {
      const uploadResults = await Promise.all(
        subTraveler[field].map(async (fileObj: { file: string }) => {
          const result = await uploadFileToCloudinary(fileObj.file);
          return { file: result.secure_url, cloudinary_id: result.public_id };
        })
      );
      subTraveler[field] = uploadResults;
    }
  }
}
 
travelerData.Travelers = travelers;
 
 
 
console.log('Final Traveler Data:', travelerData);
console.log('Nested Travelers Data:', travelerData.Travelers);
 
if (Array.isArray(req.body.Travelers)) {
  await Promise.all(
    req.body.Travelers.map(async (subTraveler:any, index:any) => {
      const subTravelerData: ISubTraveler = {
        firstName: subTraveler.firstName,
        lastName: subTraveler.lastName,
        phoneNumber: subTraveler.phoneNumber,
        email: subTraveler.email,
        localAddress: subTraveler.localAddress,
        specialNotes: subTraveler.specialNotes,
        visaType: subTraveler.visaType,
      };
 
      await Promise.all(
        fieldsToUpload.map(field =>
          uploadAndSetField(`Travelers[${index}].${field}`, subTravelerData)
        )
      );
 
      travelerData.Travelers.push(subTravelerData);
    })
  );
}
 
 
 
    const newTraveler = new TravelerModelBig(travelerData);
    await newTraveler.save();
 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Traveler created successfully!',
      data: newTraveler,
    });
 
  } catch (error) {
    console.error('Error creating traveler:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});
 
const sendMail = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone, destination } = req.body;
  if (!name || !email || !phone || !destination) {
    return res.status(400).json({ message: "Name, email, phone and destination are required." });
  }
  const emailContent = getEmailTemplate('querySubmissionMail.html', req.body);
  await sendEmail({
    to: "tech@tripnest.net", 
    subject: "New Consultancy Query Form Submission",
    html: emailContent,
  });
  return res.status(200).json({ message: "Consultancy Query Form Submission Successful" });
});


const sendMailCustomizePackageForm = catchAsync(async (req: Request, res: Response) => {
  // console.log("Customize form data",req.body);
   const { name, service, phone, email, destination, numberOfTravelers, additionalNotes,travelDate  } = req.body;
   const sanitizedData = {
    name: name || "Null",
    service: service || "Null",
    phone: phone || "Null",
    email: email || "Null",
    destination: destination || "Null",
    numberOfTravelers: numberOfTravelers || "Null",
    additionalNotes: additionalNotes || "Null",
    travelDate: travelDate || "Null",
  };
   const emailContent = getEmailTemplate('customizePackageQuerySubmissionMail.html', sanitizedData);
  await sendEmail({
    to: "tech@tripnest.net", 
    subject: "New Customize Query Form Submission",
    html: emailContent,
  });
  return res.status(200).json({ message: "Customize Query Form Submission Successful" });

});

export const travelController = {
  createTraveler,
  sendMail,
  sendMailCustomizePackageForm,
};