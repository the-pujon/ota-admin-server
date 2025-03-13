import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VisaServices } from "./visa.service";

const addVisaInfo = catchAsync(async(req, res)=>{
  const result = await VisaServices.addVisaService(req)

  // console.log(result)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Visa data saved successfully",
  });
})

const getVisaInfoByCountry = catchAsync(async(req, res)=>{
  const result = await VisaServices.getVisaInfoByCountryService(req.params.countryName)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Visa data fetched successfully",
  });
})

const updateVisaInfo = catchAsync(async(req, res)=>{
  
  const result = await VisaServices.updateVisaInfoByCountryService(req.params.countryName, req)
  // res.send("update visa info")
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Visa data updated successfully",
  });
})


const getAllVisaInfo = catchAsync(async (req, res) => {

  // console.log("req.query", req.query);
  const { page = 1, limit = 10 } = req.query; // Default values if not provided
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  const result = await VisaServices.getAllVisaInfoService(pageNumber, limitNumber);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result.data,
    meta: result.meta, 
    message: "Visa data fetched successfully",
  });
});


const getAllCountries = catchAsync(async(req, res)=>{
  const result = await VisaServices.getAllCountryNameFromAllVisaService()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Visa data deleted successfully",
  });
})
const deleteVisaInfo = catchAsync(async(req, res)=>{
  const { countryName } = req.params;
  const result = await VisaServices.deleteVisaService(countryName);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Visa data deleted successfully",
  });
})
const deleteMedia = catchAsync(async()=>{})
const getVisaInfoById = catchAsync(async()=>{})





export const VisaControllers = {
    addVisaInfo,
    getVisaInfoByCountry,
    updateVisaInfo,
    getAllVisaInfo,
    getAllCountries,
    deleteVisaInfo,
    deleteMedia,
    getVisaInfoById,
  };
  