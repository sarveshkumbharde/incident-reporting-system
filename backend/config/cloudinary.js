const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadOnCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      // optional folder name: { folder: "uploads" },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
          reject(err);
        } else {
          console.log("Upload successful:", result.secure_url);
          resolve(result);
        }
      }
    );

    // Send the file buffer to Cloudinary
    stream.end(fileBuffer);
  });
};
