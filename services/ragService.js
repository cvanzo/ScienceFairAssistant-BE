const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to split text into chunks
const splitTextIntoChunks = (text, maxTokens = 8192) => {
  const chunks = [];
  let currentChunk = '';
  let currentLength = 0;

  const words = text.split(' ');

  words.forEach(word => {
    const wordLength = word.length + 1; // Include space
    if (currentLength + wordLength > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = word + ' ';
      currentLength = wordLength;
    } else {
      currentChunk += word + ' ';
      currentLength += wordLength;
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

// Function to generate embeddings for text, splitting it into chunks if necessary
const generateEmbedding = async (text) => {
  console.log('Splitting text into chunks for embedding generation.');
  const textChunks = splitTextIntoChunks(text);
  const embeddings = [];

  for (const chunk of textChunks) {
    console.log(`Generating embedding for chunk (length: ${chunk.length}):`, chunk.substring(0, 100) + '...');
    const embeddingResponse = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: chunk
    });
    embeddings.push(embeddingResponse.data[0].embedding);
    console.log('Embedding generated successfully for the chunk.');
  }

  return embeddings;
};

// Function to find the most relevant content based on the question embedding
const findRelevantContent = (questionEmbedding, fileEmbeddings, fileContents) => {
  console.log('Finding the most relevant content for the question embedding');
  let maxSimilarity = -Infinity;
  let mostRelevantContent = '';

  fileEmbeddings.forEach((embeddingsArray, index) => {
    embeddingsArray.forEach(embedding => {
      const similarity = cosineSimilarity(questionEmbedding, embedding);
      console.log(`Similarity for file ${index + 1}:`, similarity);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostRelevantContent = fileContents[index];
      }
    });
  });

  console.log('Most relevant content found:', mostRelevantContent.substring(0, 100) + '...');
  return mostRelevantContent;
};

// Function to calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Function to generate an answer using OpenAI
const generateAnswer = async (question, fileEmbeddings, fileContents) => {
  console.log('Processing question:', question); // Log the received question

  try {
    console.log('Generating embedding for the question');
    const questionEmbedding = await generateEmbedding(question);

    console.log('Finding relevant content based on the question embedding');
    const relevantContent = findRelevantContent(questionEmbedding[0], fileEmbeddings, fileContents); // Pass the first question embedding
    
    // Prepare the prompt and call the OpenAI API
    console.log('Generating response using OpenAI API');
    const chatCompletion = await client.chat.completions.create({
      messages: [   
        { role: 'system', content: "You are a helpful science fair assistant for grades 3 to 6. Keep answers as short as possible." },
        { role: 'system', content: "This is the relevent assistant's knowledge for this question: " + relevantContent },
        { role: 'system', content: "When an answer cannot be derived from the assistant's knowledge, state that the information isn't known, then give the most probable answer if it has to do with science fair, and remind the student to ask their teacher for clarity.  You must stay on topic with science fair, if the user asks an off topic question, then state that it is off topic and contact the teacher for help if needed and do not give additional information." },
        { role: 'user', content: "Question: " + question },
      ],
      model: 'gpt-3.5-turbo',
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateAnswer:', error); // Log any errors encountered
    throw error;
  }
};

module.exports = { generateEmbedding, findRelevantContent, generateAnswer };
