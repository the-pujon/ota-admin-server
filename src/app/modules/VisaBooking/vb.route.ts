import express, { Request, Response, NextFunction } from 'express';
import { travelController } from './vb.controller';
import upload from '../../middlewares/multerMiddleware';
 
const routes = express.Router();
 
const mainTravelerFields = [
  { name: 'passport_img', maxCount: 1 },
  { name: 'photo_img', maxCount: 1 },
  { name: 'bankStatement_pdf', maxCount: 1 },
  { name: 'bankSolvencyCertificate', maxCount: 1 },
  { name: 'visitingCard', maxCount: 1 },
  { name: 'hotelBooking', maxCount: 1 },
  { name: 'airTicket', maxCount: 1 },
  { name: 'jobDocument[0]', maxCount: 1 },
  { name: 'jobDocument[1]', maxCount: 1 },
  { name: 'jobDocument[2]', maxCount: 1 },
  { name: 'jobDocument[3]', maxCount: 1 },
  { name: 'jobDocument[4]', maxCount: 1 },
  { name: 'studentDocument[0]', maxCount: 1 },
  { name: 'studentDocument[1]', maxCount: 1 },
  { name: 'studentDocument[2]', maxCount: 1 },
  { name: 'businessPersonDocument[0]', maxCount: 1 },
  { name: 'businessPersonDocument[1]', maxCount: 1 },
  { name: 'businessPersonDocument[2]', maxCount: 1 },
  { name: 'businessPersonDocument[3]', maxCount: 1 },
  { name: 'otherDocument[0]', maxCount: 1 },
];
 
const createSubTravelerFields = () => {
  const numberOfTravelers = 50; 
  const subTravelerFields = [];
  for (let i = 0; i < numberOfTravelers; i++) {
    subTravelerFields.push(
      { name: `Travelers[${i}].passport_img`, maxCount: 1 },
      { name: `Travelers[${i}].photo_img`, maxCount: 1 },
      { name: `Travelers[${i}].bankStatement_pdf`, maxCount: 1 },
      { name: `Travelers[${i}].bankSolvencyCertificate`, maxCount: 1 },
      { name: `Travelers[${i}].visitingCard`, maxCount: 1 },
      { name: `Travelers[${i}].hotelBooking`, maxCount: 1 },
      { name: `Travelers[${i}].airTicket`, maxCount: 1 },
      { name: `Travelers[${i}].jobDocument[0]`, maxCount: 1 },
      { name: `Travelers[${i}].jobDocument[1]`, maxCount: 1 },
      { name: `Travelers[${i}].jobDocument[2]`, maxCount: 1 },
      { name: `Travelers[${i}].jobDocument[3]`, maxCount: 1 },
      { name: `Travelers[${i}].jobDocument[4]`, maxCount: 1 },
      { name: `Travelers[${i}].studentDocument[0]`, maxCount: 1 },
      { name: `Travelers[${i}].studentDocument[1]`, maxCount: 1 },
      { name: `Travelers[${i}].studentDocument[2]`, maxCount: 1 },
      { name: `Travelers[${i}].businessPersonDocument[0]`, maxCount: 1 },
      { name: `Travelers[${i}].businessPersonDocument[1]`, maxCount: 1 },
      { name: `Travelers[${i}].businessPersonDocument[2]`, maxCount: 2 },
      { name: `Travelers[${i}].businessPersonDocument[3]`, maxCount: 3 },
      { name: `Travelers[${i}].otherDocument[0]`, maxCount: 1 }
    );
  }
  return subTravelerFields;
};
 
const setUploadFields = (req: Request, res: Response, next: NextFunction) => {
  try {
    const subTravelerFields = createSubTravelerFields();
    const allFields = [...mainTravelerFields, ...subTravelerFields];
 
    upload.fields(allFields)(req, res, (err) => {
      console.log(allFields, "allfeilds")
      if (err) {
        console.error("Error in file upload:", err);
        return res.status(400).json({ message: "File upload error", error: err.message });
      }
      next();
    });
  } catch (error) {
    console.error("Error setting upload fields:", error);
    res.status(500).json({ message: "Server error setting upload fields", error });
  }
};
 
routes.post('/create', setUploadFields, travelController.createTraveler);
routes.post('/send-visa-query-mail', travelController.sendMail);
routes.post('/send-customize-package-query-mail', travelController.sendMailCustomizePackageForm);
 
export const travelRoutes = routes;