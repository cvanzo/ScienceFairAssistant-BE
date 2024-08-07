const { generateAnswer } = require('../services/ragService');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

let uploadedFileContent = '';

const uploadFile = async (req, res) => {
  const file = req.file;
  if (file) {
    const filePath = path.join(__dirname, '..', file.path);
    const fileExtension = path.extname(file.originalname).toLowerCase();

    try {
      if (fileExtension === '.pdf') {
        // Read and extract text from PDF
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        uploadedFileContent = pdfData.text;
      } else {
        // For simplicity, handle other text files directly
        uploadedFileContent = fs.readFileSync(filePath, 'utf8');
      }
      res.send({ message: 'File uploaded successfully', file });
    } catch (error) {
      res.status(500).send({ error: 'Error processing file' });
    } finally {
      // Optionally delete the file after processing
      fs.unlinkSync(filePath);
    }
  } else {
    res.status(400).send({ error: 'File upload failed' });
  }
};

const askQuestion = async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await generateAnswer(question, uploadedFileContent);
    res.send({ answer });
  } catch (error) {
    res.status(500).send({ error: 'Error generating answer' });
  }
};

module.exports = { uploadFile, askQuestion };
