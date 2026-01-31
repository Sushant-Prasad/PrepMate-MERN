import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { type } from "os";
// import dotenv from "dotenv";
// dotenv.config({path : './env'});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType, // image | video | raw
      folder: "chat_uploads",
      type: "upload"
    });

    fs.unlinkSync(localFilePath); // cleanup temp file
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};


const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const res = await cloudinary.uploader.destroy(publicId);
    return res; // { result: 'ok' }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};


export { uploadOnCloudinary, deleteFromCloudinary };