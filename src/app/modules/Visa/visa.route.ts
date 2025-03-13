import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { VisaControllers } from './visa.controller';
import { upload } from '../../utils/multerConfig';

const router = express.Router();

// router.post('/addVisaInfo',upload.any(),  VisaControllers.addVisaInfo,);

// router.put('/:countryName', upload.any(), VisaControllers.updateVisaInfo);

// router.delete('/:countryName', VisaControllers.deleteVisaInfo);

// router.delete('/delete-media', VisaControllers.deleteMedia);

// router.get('/:countryName', VisaControllers.getVisaInfoByCountry);

// router.get('/countries/allCountries', VisaControllers.getAllCountries);

// router.get('/countries/allVisaData', VisaControllers.getAllCountriesData);
// router.get('/countries/getVisaInfoById/:visaCountryId', VisaControllers.getVisaInfoById);

export const VisaRoutes = router;
