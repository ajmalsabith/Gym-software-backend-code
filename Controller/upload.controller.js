// ===========================================
// IMPORTANT: Install multer package first!
// Run: npm install multer
// Then uncomment the multer require and all commented code below
// ===========================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Maximum 10 files
  }
});

// Upload multiple images (up to 10)
const uploadImages = async (req, res) => {
  try {
    // Use multer middleware
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Maximum 10 images allowed'
            });
          }
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum 5MB allowed'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }

      // Process uploaded files
      const uploadedImages = req.files.map(file => {
        return {
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          url: `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        };
      });

      res.status(200).json({
        success: true,
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        images: uploadedImages,
        count: uploadedImages.length
      });

    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    // Use multer middleware for single file
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum 5MB allowed'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const uploadedImage = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        url: `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      };

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        image: uploadedImage
      });

    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
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
