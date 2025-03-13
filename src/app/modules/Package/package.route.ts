import express from 'express';
import upload from '../../middlewares/multerMiddleware';
import { handleMulterErrors } from '../../errors/handleMulterErrors';
import { packageController } from './package.controller';



const router = express.Router();

router.post(
  '/create',
  upload.array('images', 4),
  handleMulterErrors,
  packageController.createPackage
);
router.get(
  '/',
  packageController.allPackage
);
router.get(
  '/countries',
  packageController.packageAllCountries
);
router.get(
  '/totalPrice',
  packageController.getTotalPrice
);

router.get(
  '/:country/:titleName',
  packageController.getPackageByCountryAndTitle
);



export const packageRoutes = router;
