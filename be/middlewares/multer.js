const multer = require('multer');

// Allowed image file extensions
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

// Function to validate file type
const fileFilter = (req, file, cb) => {
  const isAllowedExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
  const isAllowedMimeType = file.mimetype.startsWith('image/');

  if (isAllowedExtension && isAllowedMimeType) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'));
  }
};

// Initialize Multer middleware with file validation
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = { upload };
