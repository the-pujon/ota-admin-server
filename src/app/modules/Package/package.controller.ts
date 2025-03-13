
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { packageService } from './package.service';
import queryFilter from '../../utils/queryFilter';
import { filterableFields, paginationFields } from './package.constant';
import { IPackage } from './package.interface';
import PackageModel from './package.model';


const createPackage = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {

    const files = req.files as Express.Multer.File[]; // Files uploaded from Multer


		const result = await packageService.createPackage(req.body ,files);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: 'Package Created Successfully !',
			data: result,
		});
	}
);

const getPackageByCountryAndTitle  = catchAsync(async (req: Request, res: Response) => {

	const{country,titleName}=req.params;

	// remove hyphen- from title
	const title=titleName.replace(/-/g, " ");


	const result = await packageService.getPackageByCountryAndTitle(country,title);

	sendResponse<any>(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Package get Successfully !',
		// meta: result.meta,
		data: result,
	});

});


const allPackage = catchAsync(async (req: Request, res: Response) => {

	const filters = queryFilter(req.query, filterableFields);
	const paginationOptions = queryFilter(req.query, paginationFields);


	const result = await packageService.allPackage(filters, paginationOptions);

	sendResponse<IPackage[]>(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Packages get Successfully !',
		// meta: result.meta,
		data: result.data,
	});

});


  export const packageAllCountries = async (req: Request, res: Response) => {
	try {
	  const products = await PackageModel.distinct('country');; // Get only product names
	  res.status(200).json(products);
	} catch (error) {
	  res.status(500).json({ error: 'Failed to fetch country names' });
	}
  };

  export const getTotalPrice = async (req: Request, res: Response) => {
	try {
	  // Fetch all packages with only the price field
	  const packages = await PackageModel.find().select('price');

	  // Sum all prices using reduce
	  const totalPrice = packages.reduce((sum, pkg) => sum + pkg.price, 0);
	  res.status(200).send(totalPrice.toString());
	} catch (error) {
	  res.status(500).json({ error: 'Failed to calculate total price' });
	}
  };
  


export const packageController = {
	createPackage,
	getPackageByCountryAndTitle,
    allPackage,
	packageAllCountries,
	getTotalPrice
};
