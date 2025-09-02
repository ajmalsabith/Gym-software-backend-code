const express = require('express');
const uploadRouter = express();
const UploadController = require('../Controller/upload.controller');

// Image upload routes
uploadRouter.post('/multiple', UploadController.uploadImages); // Upload up to 10 images
uploadRouter.post('/single', UploadController.uploadSingleImage); // Upload single image
uploadRouter.get('/all', UploadController.getAllImages); // Get all uploaded images
uploadRouter.delete('/:filename', UploadController.deleteImage); // Delete image by filename

module.exports = uploadRouter;
