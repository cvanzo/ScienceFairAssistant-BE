const { generateAnswer, generateEmbedding } = require('../services/ragService');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

let fileContents = []; // Array to store file contents
let fileEmbeddings = []; // Array to store arrays of embeddings

const uploadFile = async (req, res) => {
  const files = req.files;
  if (files && files.length > 0) {
    console.log(`Received ${files.length} file(s) for processing.`);
    try {
      for (let file of files) {
        const filePath = path.join(__dirname, '..', file.path);
        const fileExtension = path.extname(file.originalname).toLowerCase();
        let content = '';

        if (fileExtension === '.pdf') {
          console.log(`Processing PDF file: ${file.originalname}`);
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          content = pdfData.text;
        } else {
          console.log(`Processing text file: ${file.originalname}`);
          content = fs.readFileSync(filePath, 'utf8');
        }

        console.log(`Generating embeddings for the content of file: ${file.originalname}`);
        const embeddings = await generateEmbedding(content); // Generate embeddings for the file content
        fileContents.push(content);
        fileEmbeddings.push(embeddings); // Store all embeddings for this file
      }
      console.log('All files processed successfully.');
      res.send({ message: 'Files uploaded and processed successfully' });
    } catch (error) {
      console.error('Error during file processing:', error);
      res.status(500).send({ error: 'Error processing files' });
    } finally {
      files.forEach(file => fs.unlinkSync(path.join(__dirname, '..', file.path))); // Cleanup
    }
  } else {
    console.log('No files uploaded.');
    res.status(400).send({ error: 'File upload failed' });
  }
};

const askQuestion = async (req, res) => {
  const { question } = req.body;
  console.log('Received question:', question);
  try {
    console.log('Generating answer for the question based on uploaded content.');
    const answer = await generateAnswer(question, fileEmbeddings, fileContents);
    console.log('Answer generated successfully:', answer);
    res.send({ answer });
  } catch (error) {
    console.error('Error generating answer:', error);
    res.status(500).send({ error: 'Error generating answer' });
  }
};

module.exports = { uploadFile, askQuestion };
