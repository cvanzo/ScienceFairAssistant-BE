const express = require('express');
const { uploadFile, askQuestion } = require('../controllers/apiController');
const multer = require('multer');

// Initialize the router and configure file upload with multer
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Define the route for file upload
router.post('/upload', upload.single('file'), uploadFile);

// Define the route for asking a question
router.post('/ask', askQuestion);

module.exports = router;
