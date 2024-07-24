const multer = require('multer');

// Allowed file extensions
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov', '.wmv'];

// Function to validate file type
const fileFilter = (req, file, cb) => {
  const isAllowedExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
  const isAllowedMimeType = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

  if (isAllowedExtension && isAllowedMimeType) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Hanya file gambar dan video yang diperbolehkan!'));
  }
};

// Initialize Multer middleware with file validation
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

module.exports = { upload };