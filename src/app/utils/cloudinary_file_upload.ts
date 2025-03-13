
import AppError from "../errors/AppError";
import cloudinary from "./cloudinary";
import fs from "fs";



export const uploadImage = async (filePath: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    throw new AppError(500, 'Failed to upload image to Cloudinary');
  }
};

export const deleteImage = async (cloudinaryId: string) => {
  try {
    await cloudinary.uploader.destroy(cloudinaryId);
  } catch (error) {
    throw new AppError(500, 'Failed to delete image from Cloudinary');
  }
};

export const deleteLocalFile = (filePath: string) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new AppError(500, 'Failed to delete local file');
  }
};
