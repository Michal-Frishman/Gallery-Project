const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary'); // נניח שיצרת services/cloudinary.js

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'images', // או כל שם תיקייה שתרצי ב-Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
