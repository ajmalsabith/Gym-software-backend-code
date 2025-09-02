// ===========================================
// IMPORTANT: Install multer package first!
// Run: npm install multer
// Then uncomment the multer require and all commented code below
// ===========================================

// const multer = require('multer'); // Uncomment after installing multer
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Create uploads directory if it doesn't exist
//     const uploadDir = 'uploads/images';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     // Generate unique filename with timestamp
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // File filter to only allow images
// const fileFilter = (req, file, cb) => {
//   // Check file type
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

// // Configure multer
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB max file size
//     files: 10 // Maximum 10 files
//   }
// });

// Upload multiple images (up to 10)
const uploadImages = async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Image upload temporarily disabled. Please install multer package first.',
    instructions: 'Run: npm install multer'
  });
};

// Upload single image
const uploadSingleImage = async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Image upload temporarily disabled. Please install multer package first.',
    instructions: 'Run: npm install multer'
  });
};

// Delete image by filename
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const imagePath = path.join('uploads/images', filename);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete file
    fs.unlinkSync(imagePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      deletedFile: filename
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// Get all uploaded images
const getAllImages = async (req, res) => {
  try {
    const uploadDir = 'uploads/images';
    
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({
        success: true,
        images: [],
        count: 0
      });
    }

    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          url: `${req.protocol}://${req.get('host')}/uploads/images/${file}`,
          size: stats.size,
          uploadedAt: stats.mtime
        };
      });

    res.status(200).json({
      success: true,
      images: images,
      count: images.length
    });

  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting images',
      error: error.message
    });
  }
};

module.exports = {
  uploadImages,
  uploadSingleImage,
  deleteImage,
  getAllImages
};
