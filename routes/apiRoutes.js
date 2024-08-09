const express = require('express');
const { uploadFile, askQuestion } = require('../controllers/apiController');
const multer = require('multer');

// Initialize the router and configure file upload with multer
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Configure multer to accept multiple files with the field name 'files'
const uploadMultiple = upload.array('files'); 

// Use the middleware in your upload route
router.post('/upload', uploadMultiple, uploadFile);

// Define the route for asking a question
router.post('/ask', askQuestion);

module.exports = router;
