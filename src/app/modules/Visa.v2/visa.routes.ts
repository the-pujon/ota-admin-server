import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { VisaControllers } from './visa.controller';
import { upload } from '../../utils/multerConfig';
import { visaValidationSchema } from './visa.validation';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.post('/addVisaInfo',upload.any(), 
(req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof req.body.data === 'string') {
        req.body = JSON.parse(req.body.data);
      }
      // console.log("req.body from router", req.body);
      next();
    } catch (error) {
      next(error);
    }
  },
  validateRequest(visaValidationSchema),
VisaControllers.addVisaInfo,);

router.put('/:countryName', upload.any(),
(req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body.data === 'string') {
      req.body = JSON.parse(req.body.data);
    }
    // console.log("req.body from router", req.body);
    next();
  } catch (error) {
    next(error);
  }
},
VisaControllers.updateVisaInfo);

router.delete('/:countryName', VisaControllers.deleteVisaInfo);

// router.delete('/delete-media', VisaControllers.deleteMedia);

router.get('/:countryName', VisaControllers.getVisaInfoByCountry);

// router.get('/countries/allCountries', VisaControllers.getAllCountries);

router.get('/countries/allVisaData', VisaControllers.getAllVisaInfo);
// router.get('/countries/getVisaInfoById/:visaCountryId', VisaControllers.getVisaInfoById);

export const VisaRoutesV2 = router;
